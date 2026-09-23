import 'dart:async';
import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:shri_ji_bazaar/features/payments/presentation/controllers/payment_controller.dart';
import 'package:webview_flutter/webview_flutter.dart';

class ImbPaymentPage extends StatefulWidget {
  final String paymentUrl;
  final String orderId;
  final double amount;

  const ImbPaymentPage({
    super.key,
    required this.paymentUrl,
    required this.orderId,
    required this.amount,
  });

  @override
  State<ImbPaymentPage> createState() => _ImbPaymentPageState();
}

class _ImbPaymentPageState extends State<ImbPaymentPage> {
  late final WebViewController _webViewController;
  bool _isLoading = true;
  bool _isProcessing = false;
  String? _error;
  Timer? _pollTimer;

  @override
  void initState() {
    super.initState();
    _webViewController = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (_) {
            if (mounted) {
              setState(() => _isLoading = true);
            }
          },
          onPageFinished: (_) {
            if (mounted) {
              setState(() => _isLoading = false);
            }
            _startPollingForResult();
          },
          onNavigationRequest: (request) {
            // Fallback: if IMB redirects to callback, detect it from URL params
            final uri = Uri.tryParse(request.url);
            if (uri != null && (uri.host.contains('imb') || uri.path.contains('/callback'))) {
              final status = uri.queryParameters['status'];
              if (status == 'success' || status == 'completed') {
                _pollTimer?.cancel();
                _handlePaymentSuccess();
                return NavigationDecision.prevent;
              } else if (status == 'failed') {
                _pollTimer?.cancel();
                _handlePaymentFailed();
                return NavigationDecision.prevent;
              }
            }
            return NavigationDecision.navigate;
          },
          onWebResourceError: (error) {
            if (mounted && _isLoading) {
              setState(() {
                _isLoading = false;
                _error = 'Failed to load payment page. Please check your internet connection.';
              });
            }
          },
        ),
      )
      ..loadRequest(Uri.parse(widget.paymentUrl));
  }

  void _startPollingForResult() {
    _pollTimer = Timer.periodic(const Duration(milliseconds: 500), (timer) async {
      try {
        final result = await _webViewController.runJavaScriptReturningResult('''
          (function() {
            var status = localStorage.getItem('imb_payment_status');
            var orderId = localStorage.getItem('imb_order_id');
            if (status && orderId) {
              return JSON.stringify({status: status, orderId: orderId});
            }
            return null;
          })()
        ''');

        // WebView wraps JS return in an extra layer; extract the actual string
        String? jsonStr;
        if (result is String) {
          jsonStr = result;
        }

        if (jsonStr != null && jsonStr != 'null' && jsonStr.isNotEmpty) {
          jsonStr = jsonStr.trim();

          // Remove the outer quotes WebView adds (e.g. "\"{...}\"" -> "{...}")
          if ((jsonStr.startsWith('"') && jsonStr.endsWith('"')) ||
              (jsonStr.startsWith("'") && jsonStr.endsWith("'"))) {
            jsonStr = jsonStr.substring(1, jsonStr.length - 1);
          }

          // Unescape the inner content
          jsonStr = jsonStr.replaceAll(r'\"', '"').replaceAll(r"\'", "'");

          if (jsonStr.contains('"success"') || jsonStr.contains('"completed"')) {
            timer.cancel();
            _handlePaymentSuccess();
          } else if (jsonStr.contains('"failed"')) {
            timer.cancel();
            _handlePaymentFailed();
          }
        }
      } catch (e) {
        // Silently continue polling on transient errors
      }
    });

    // Stop polling after 5 minutes
    Future.delayed(const Duration(minutes: 5), () {
      _pollTimer?.cancel();
    });
  }

  void _handlePaymentSuccess() {
    if (!mounted) return;

    setState(() {
      _isProcessing = true;
      _error = null;
    });

    Fluttertoast.showToast(
      msg: 'Payment successful! Crediting your wallet...',
      toastLength: Toast.LENGTH_SHORT,
      backgroundColor: const Color(0xFF25C85A),
      textColor: Colors.white,
    );

    // Wait for webhook to process, then refresh history and navigate back
    Future.delayed(const Duration(seconds: 4), () async {
      if (!mounted) return;

      final controller = Provider.of<PaymentController>(context, listen: false);
      await controller.loadHistory();

      if (mounted) {
        context.pop(true);
      }
    });
  }

  void _handlePaymentFailed() {
    if (!mounted) return;

    setState(() {
      _isProcessing = false;
      _error = 'Payment failed or was cancelled. Please try again.';
    });

    Fluttertoast.showToast(
      msg: 'Payment failed',
      toastLength: Toast.LENGTH_SHORT,
      backgroundColor: const Color(0xFFE53935),
      textColor: Colors.white,
    );
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Pay via IMPS'),
        automaticallyImplyLeading: false,
        actions: [
          if (!_isProcessing)
            IconButton(
              onPressed: () => context.pop(),
              icon: const Icon(Icons.close_rounded),
              tooltip: 'Cancel',
            ),
        ],
      ),
      body: Stack(
        children: [
          WebViewWidget(controller: _webViewController),
          if (_isLoading)
            const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(),
                  SizedBox(height: 16),
                  Text('Loading secure payment page...'),
                ],
              ),
            ),
          if (_error != null && !_isProcessing)
            Positioned(
              top: 0,
              left: 0,
              right: 0,
              child: Container(
                margin: const EdgeInsets.all(16),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFE53935).withValues(alpha: 0.95),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.error_outline_rounded, color: Colors.white),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        _error!,
                        style: const TextStyle(color: Colors.white, fontSize: 13),
                      ),
                    ),
                    IconButton(
                      onPressed: () => setState(() => _error = null),
                      icon: const Icon(Icons.close_rounded, color: Colors.white, size: 18),
                    ),
                  ],
                ),
              ),
            ),
          if (_isProcessing)
            Positioned.fill(
              child: Container(
                color: const Color(0xFF120C05).withValues(alpha: 0.85),
                child: const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      CircularProgressIndicator(color: Color(0xFFD89B18)),
                      SizedBox(height: 20),
                      Text(
                        'Verifying payment...',
                        style: TextStyle(fontSize: 16, color: Colors.white),
                      ),
                      SizedBox(height: 8),
                      Text(
                        'Do not close this page',
                        style: TextStyle(fontSize: 13, color: Colors.grey),
                      ),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
