import 'dart:async';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:go_router/go_router.dart';
import 'package:shri_ji_bazaar/core/theme/app_colors.dart';
import 'package:shri_ji_bazaar/core/theme/app_text_styles.dart';
import 'package:shri_ji_bazaar/core/routes/route_names.dart';
import '../../../../core/widgets/sidebar_toggle.dart';
import '../../../../core/network/api_service.dart';

class PlayPage extends StatefulWidget {
  final String gameId;
  final String gameName;
  final String roundId;

  const PlayPage({super.key, this.gameId = '', this.gameName = '', this.roundId = ''});

  @override
  State<PlayPage> createState() => _PlayPageState();
}

class _PlayPageState extends State<PlayPage> {
  final ApiService _api = ApiService();
  Map<String, dynamic>? _liveMarket;
  List<dynamic> _upcomingMarkets = [];
  List<dynamic> _recentResults = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadAllData();
  }

  Future<void> _loadAllData() async {
    setState(() => _loading = true);
    try {
      final results = await Future.wait([
        _api.get('/rounds/active'),
        _api.get('/rounds/upcoming'),
        _api.get('/results/latest', queryParameters: {'limit': 10}),
      ]);

      final activeData = results[0] as Map<String, dynamic>?;
      final upcomingData = results[1] as List<dynamic>? ?? [];
      final resultsData = results[2] as List<dynamic>? ?? [];

      final upcomingWithNames = <Map<String, dynamic>>[];
      for (final round in upcomingData) {
        final gameId = round['game_id'] as String?;
        String gameName = 'Unknown';
        if (gameId != null) {
          try {
            final games = await _api.get('/games');
            final gamesList = games as List<dynamic>;
            final match = gamesList.cast<Map<String, dynamic>>().firstWhere(
              (g) => g['id'] == gameId,
              orElse: () => <String, dynamic>{},
            );
            gameName = match['name'] ?? 'Unknown';
          } catch (_) {}
        }
        upcomingWithNames.add(Map<String, dynamic>.from(round)..['gameName'] = gameName);
      }

      if (mounted) {
        setState(() {
          _liveMarket = activeData;
          _upcomingMarkets = upcomingWithNames;
          _recentResults = resultsData;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _openWhatsApp() async {
    final phone = Uri.encodeComponent('YOUR_PHONE_NUMBER');
    final text = Uri.encodeComponent('Hello');
    final url = 'https://wa.me/$phone?text=$text';
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  Future<void> _openTelegram() async {
    final telegramUrl = Uri.parse('https://t.me/YOUR_USERNAME');
    if (await canLaunchUrl(telegramUrl)) {
      await launchUrl(telegramUrl, mode: LaunchMode.externalApplication);
    }
  }

  String _formatTimeLeft(String? endTime) {
    if (endTime == null) return '';
    try {
      final end = DateTime.parse(endTime);
      final now = DateTime.now();
      final diff = end.difference(now);
      if (diff.isNegative) return '00h 00m 00s';
      final h = diff.inHours.toString().padLeft(2, '0');
      final m = (diff.inMinutes % 60).toString().padLeft(2, '0');
      final s = (diff.inSeconds % 60).toString().padLeft(2, '0');
      return '$h:$m:$s';
    } catch (_) {
      return '';
    }
  }

  String _formatAmPm(String? timeStr) {
    if (timeStr == null) return '';
    try {
      final dt = DateTime.parse(timeStr);
      final h = dt.hour > 12 ? dt.hour - 12 : dt.hour;
      final m = dt.minute.toString().padLeft(2, '0');
      final period = dt.hour >= 12 ? 'PM' : 'AM';
      return '$h:$m $period';
    } catch (_) {
      return timeStr;
    }
  }

  String _getLastResultForGame(String gameName) {
    for (final r in _recentResults) {
      if ((r['game_name'] ?? '').toUpperCase() == gameName.toUpperCase()) {
        return r['result'] ?? '--';
      }
    }
    return '--';
  }

  void _openWager(BuildContext context, Map<String, dynamic> market) {
    final gameId = market['game_id'] ?? market['gameId'] ?? '';
    final gameName = market['game_name'] ?? market['gameName'] ?? '';
    final roundId = market['id'] ?? '';
    context.push(RouteNames.play, extra: {
      'gameId': gameId,
      'gameName': gameName,
      'roundId': roundId,
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _loadAllData,
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header
                Row(
                  children: [
                    const SidebarToggle(),
                    const Spacer(),
                    Text(
                      'WIN BAZAR',
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary, letterSpacing: 1.2),
                    ),
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                      decoration: BoxDecoration(
                        color: AppColors.cardSecondary,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Text(
                        '₹ 5',
                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 16),

                // Banner
                Container(
                  width: double.infinity,
                  height: 100,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF1A237E), Color(0xFF283593), Color(0xFF3949AB)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),

                const SizedBox(height: 14),

                // Social + Action buttons
                Row(
                  children: [
                    Expanded(
                      child: _ActionButton(
                        label: 'WhatsApp',
                        backgroundColor: const Color(0xFF25D366),
                        textColor: Colors.white,
                        icon: Icons.message_rounded,
                        onTap: _openWhatsApp,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: _ActionButton(
                        label: 'Telegram',
                        backgroundColor: const Color(0xFF0088CC),
                        textColor: Colors.white,
                        icon: Icons.telegram_rounded,
                        onTap: _openTelegram,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: _ActionButton(
                        label: 'Withdraw',
                        backgroundColor: AppColors.error,
                        textColor: Colors.white,
                        icon: Icons.arrow_upward_rounded,
                        onTap: () => context.push(RouteNames.withdraw),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: _ActionButton(
                        label: 'Add Money',
                        backgroundColor: AppColors.success,
                        textColor: Colors.white,
                        icon: Icons.account_balance_wallet_rounded,
                        onTap: () => context.push(RouteNames.deposit),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 20),

                // LIVE MARKET section
                Text(
                  'LIVE MARKET',
                  style: AppTextStyles.sectionHeading.copyWith(
                    fontSize: 16,
                    color: AppColors.goldBright,
                    letterSpacing: 1.0,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 10),

                if (_loading)
                  const Center(child: Padding(padding: EdgeInsets.all(24), child: CircularProgressIndicator(color: AppColors.success)))
                else if (_liveMarket != null)
                  _LiveMarketCard(
                    market: _liveMarket!,
                    onPlay: () => _openWager(context, _liveMarket!),
                    timeLeft: _formatTimeLeft(_liveMarket!['end_time'] ?? _liveMarket!['endTime']),
                    lastResult: _getLastResultForGame(_liveMarket!['game_name'] ?? _liveMarket!['gameName'] ?? ''),
                    resultTime: _formatAmPm(_liveMarket!['result_time'] ?? _liveMarket!['resultTime']),
                  )
                else
                  _EmptyMarketCard(label: 'No Live Market', status: 'WAITING', statusColor: AppColors.warning),

                const SizedBox(height: 20),

                // UPCOMING MARKET section
                Text(
                  'UPCOMING MARKET',
                  style: AppTextStyles.sectionHeading.copyWith(
                    fontSize: 16,
                    color: AppColors.goldBright,
                    letterSpacing: 1.0,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 10),

                if (_upcomingMarkets.isEmpty)
                  _EmptyMarketCard(label: 'No Upcoming Markets', status: 'WAITING', statusColor: AppColors.warning)
                else
                  ...List.generate(_upcomingMarkets.length, (index) {
                    final market = _upcomingMarkets[index];
                    return _UpcomingMarketCard(
                      name: (market['gameName'] ?? 'Unknown').toUpperCase(),
                      status: 'WAITING',
                      statusColor: AppColors.warning,
                      openTime: _formatAmPm(market['start_time'] ?? market['startTime']),
                      closeTime: _formatAmPm(market['end_time'] ?? market['endTime']),
                      onWait: () {},
                    );
                  }),

                const SizedBox(height: 80),
              ],
            ),
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _loadAllData,
        backgroundColor: AppColors.goldDark,
        shape: const CircleBorder(),
        child: const Icon(Icons.refresh_rounded, color: Colors.white, size: 22),
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  final String label;
  final Color backgroundColor;
  final Color textColor;
  final IconData icon;
  final VoidCallback onTap;

  const _ActionButton({
    required this.label,
    required this.backgroundColor,
    required this.textColor,
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: backgroundColor,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: textColor, size: 18),
            const SizedBox(width: 8),
            Text(label, style: TextStyle(color: textColor, fontWeight: FontWeight.w700, fontSize: 14)),
          ],
        ),
      ),
    );
  }
}

class _LiveMarketCard extends StatelessWidget {
  final Map<String, dynamic> market;
  final VoidCallback onPlay;
  final String timeLeft;
  final String lastResult;
  final String resultTime;

  const _LiveMarketCard({
    required this.market,
    required this.onPlay,
    required this.timeLeft,
    required this.lastResult,
    required this.resultTime,
  });

  @override
  Widget build(BuildContext context) {
    final name = (market['game_name'] ?? market['gameName'] ?? 'DESAWAR').toUpperCase();

    return Container(
      decoration: BoxDecoration(
        color: AppColors.cardSecondary,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Row(
              children: [
                Text(name, style: AppTextStyles.cardTitle.copyWith(fontSize: 18, color: AppColors.textPrimary)),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.success.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text('RUNNING', style: AppTextStyles.caption.copyWith(color: AppColors.success, fontWeight: FontWeight.w700, letterSpacing: 0.5)),
                ),
              ],
            ),
          ),

          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(timeLeft, style: AppTextStyles.cardTitle.copyWith(color: AppColors.goldBright, fontFamily: 'monospace', fontSize: 18)),
                      const SizedBox(height: 2),
                      Text('3h 48m 7sec left', style: AppTextStyles.caption.copyWith(color: AppColors.textSecondary)),
                    ],
                  ),
                ),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Last Result : $lastResult', style: AppTextStyles.bodySmall.copyWith(color: AppColors.goldBright, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 8),
                      Text('Result Time : $resultTime', style: AppTextStyles.caption.copyWith(color: AppColors.textSecondary)),
                    ],
                  ),
                ),
                Container(
                  decoration: BoxDecoration(
                    color: AppColors.success,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: TextButton.icon(
                    onPressed: onPlay,
                    icon: const Icon(Icons.play_arrow_rounded, color: Colors.white, size: 20),
                    label: Text('Play', style: AppTextStyles.body.copyWith(color: Colors.white, fontWeight: FontWeight.w800)),
                  ),
                ),
              ],
            ),
          ),

          Container(
            margin: const EdgeInsets.fromLTRB(12, 4, 12, 0),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: AppColors.success,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                Text('Last Result : $lastResult', style: AppTextStyles.bodySmall.copyWith(color: Colors.white, fontWeight: FontWeight.w600)),
                const Spacer(),
                Text('Result Time : $resultTime', style: AppTextStyles.caption.copyWith(color: Colors.white70)),
              ],
            ),
          ),
          const SizedBox(height: 8),
        ],
      ),
    );
  }
}

class _UpcomingMarketCard extends StatelessWidget {
  final String name;
  final String status;
  final Color statusColor;
  final String openTime;
  final String closeTime;
  final VoidCallback onWait;

  const _UpcomingMarketCard({
    required this.name,
    required this.status,
    required this.statusColor,
    required this.openTime,
    required this.closeTime,
    required this.onWait,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: AppColors.cardSecondary,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 6),
            child: Row(
              children: [
                Text(name, style: AppTextStyles.cardTitle.copyWith(fontSize: 16, color: AppColors.textPrimary)),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: statusColor.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(status, style: AppTextStyles.caption.copyWith(color: statusColor, fontWeight: FontWeight.w700, letterSpacing: 0.5)),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 4, 16, 6),
            child: Row(
              children: [
                Expanded(
                  child: Row(
                    children: [
                      Icon(Icons.schedule_rounded, size: 14, color: AppColors.success),
                      const SizedBox(width: 4),
                      Text('Open Time : $openTime', style: AppTextStyles.caption.copyWith(color: AppColors.success, fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
                Expanded(
                  child: Row(
                    children: [
                      Icon(Icons.access_time_rounded, size: 14, color: AppColors.success),
                      const SizedBox(width: 4),
                      Text('Close Time : $closeTime', style: AppTextStyles.caption.copyWith(color: AppColors.success, fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Container(
            margin: const EdgeInsets.fromLTRB(12, 4, 12, 12),
            height: 36,
            decoration: BoxDecoration(
              color: AppColors.success,
              borderRadius: BorderRadius.circular(8),
            ),
            child: TextButton.icon(
              onPressed: onWait,
              icon: Icon(Icons.schedule_rounded, color: Colors.white, size: 18),
              label: Text('Wait', style: AppTextStyles.body.copyWith(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 14)),
            ),
          ),
        ],
      ),
    );
  }
}

class _EmptyMarketCard extends StatelessWidget {
  final String label;
  final String status;
  final Color statusColor;

  const _EmptyMarketCard({required this.label, required this.status, required this.statusColor});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 28),
      decoration: BoxDecoration(
        color: AppColors.cardSecondary,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Center(child: Text(label, style: AppTextStyles.body.copyWith(color: AppColors.textSecondary))),
    );
  }
}
