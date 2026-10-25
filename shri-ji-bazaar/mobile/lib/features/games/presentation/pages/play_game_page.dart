import 'dart:async';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:shri_ji_bazaar/core/network/api_service.dart';
import 'package:shri_ji_bazaar/core/routes/route_names.dart';
import 'package:shri_ji_bazaar/core/theme/app_colors.dart';
import 'package:shri_ji_bazaar/core/theme/app_text_styles.dart';
import '../../domain/entities/wager_entry.dart';
import '../../domain/game_play_config.dart';
import '../controllers/play_game_controller.dart';

/// The Play Game screen. Opened from a game card's Play button with a
/// [gameId]. Reads the game's config, shows the play types that game
/// supports, lets the user enter/save entries, and submits them to
/// `POST /wagers`.
class PlayGamePage extends StatefulWidget {
  final String gameId;

  const PlayGamePage({super.key, required this.gameId});

  @override
  State<PlayGamePage> createState() => _PlayGamePageState();
}

class _PlayGamePageState extends State<PlayGamePage> {
  late final PlayGameController _controller;
  late final TextEditingController _numberController;
  late final TextEditingController _amountController;
  late final TextEditingController _pasteController;

  Timer? _tick;
  DateTime? _lastActiveEndTime;

  @override
  void initState() {
    super.initState();
    _numberController = TextEditingController();
    _amountController = TextEditingController();
    _pasteController = TextEditingController();
    _controller = PlayGameController(
      gameId: widget.gameId,
      api: ApiService(),
    );
    _controller.load();
    _tick = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) setState(() {}); // drives countdown re-render
    });
  }

  @override
  void didUpdateWidget(PlayGamePage oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.gameId != widget.gameId) {
      // Replace the controller for the new game so state doesn't leak.
      _controller.dispose();
      _controller = PlayGameController(
        gameId: widget.gameId,
        api: ApiService(),
      );
      _clearControllers();
      _controller.load();
    }
  }

  @override
  void dispose() {
    _tick?.cancel();
    _numberController.dispose();
    _amountController.dispose();
    _pasteController.dispose();
    _controller.dispose();
    super.dispose();
  }

  void _clearControllers() {
    _numberController.clear();
    _amountController.clear();
    _pasteController.clear();
  }

  String _gameName(PlayGameController c) {
    final name = c.game?['name'] as String?;
    return (name?.isNotEmpty == true ? name : 'GAME').toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.success,
        elevation: 0,
        centerTitle: false,
        leading: IconButton(
          onPressed: () => context.pop(),
          icon: const Icon(Icons.arrow_back_rounded, color: Colors.white),
        ),
        title: Consumer<PlayGameController>(
          builder: (context, c, _) {
            final subtitle = c.activeRound != null
                ? 'Round ${c.activeRound?['round_number'] ?? c.activeRound?['roundNumber'] ?? ''}'
                : 'Not open yet';
            return Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(_gameName(c), style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w800)),
                Text(subtitle, style: const TextStyle(color: Colors.white70, fontSize: 12)),
              ],
            );
          },
        ),
        actions: [
          if (_controller.activeRound != null)
            Padding(
              padding: const EdgeInsets.only(right: 16),
              child: _CountdownPill(controller: _controller),
            ),
        ],
      ),
      body: Consumer<PlayGameController>(
        builder: (context, c, _) {
          if (c.loading) {
            return const Center(child: CircularProgressIndicator(color: AppColors.success));
          }
          if (c.errorMessage != null) {
            return _MessageBody(message: c.errorMessage!, onRetry: () => c.load());
          }
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 8),
              _GameMetaRow(controller: c),
              const SizedBox(height: 12),
              // Play-type tabs
              _PlayTypeTabs(controller: c),
              const SizedBox(height: 12),
              // Input area for the selected tab
              if (c.activeTabIndex < c.activePlayTypes.length - 1)
                _EntryForm(controller: c, numberController: _numberController, amountController: _amountController)
              else
                _CopyPastePanel(controller: c, pasteController: _pasteController),
              const SizedBox(height: 16),
              // Saved entries table
              _SavedEntriesTable(controller: c),
              const SizedBox(height: 16),
              _SubmitBar(controller: c),
              const SizedBox(height: 16),
            ],
          );
        },
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Sub-widgets
// ---------------------------------------------------------------------------

class _CountdownPill extends StatelessWidget {
  final PlayGameController controller;
  const _CountdownPill({required this.controller});

  String _format(DateTime? end) {
    if (end == null) return '--:--:--';
    final diff = end.difference(DateTime.now());
    if (diff.isNegative) return 'OPEN';
    final h = diff.inHours.toString().padLeft(2, '0');
    final m = (diff.inMinutes % 60).toString().padLeft(2, '0');
    final s = (diff.inSeconds % 60).toString().padLeft(2, '0');
    return '$h:$m:$s';
  }

  @override
  Widget build(BuildContext context) {
    final raw = controller.activeRound?['end_time'] ?? controller.activeRound?['endTime'];
    final end = raw is String ? DateTime.tryParse(raw) : raw is DateTime ? raw : null;
    if (end == null) return const SizedBox.shrink();
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.black.withValues(alpha: 0.25),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        _format(end),
        style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700, fontFamily: 'monospace'),
      ),
    );
  }
}

class _GameMetaRow extends StatelessWidget {
  final PlayGameController controller;
  const _GameMetaRow({required this.controller});

  @override
  Widget build(BuildContext context) {
    final g = controller.game ?? {};
    String t(String k) {
      final v = g[k] as String?;
      return (v?.isNotEmpty == true ? v : '--');
    }
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _Meta(label: 'Opens', value: t('opening_time') ?? t('openingTime')),
          _Meta(label: 'Closes', value: t('closing_time') ?? t('closingTime')),
          _Meta(label: 'Result', value: t('result_time') ?? t('resultTime')),
        ],
      ),
    );
  }
}

class _Meta extends StatelessWidget {
  final String label;
  final String value;
  const _Meta({required this.label, required this.value});
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(label.toUpperCase(), style: const TextStyle(color: AppColors.textMuted, fontSize: 10, letterSpacing: 1)),
        const SizedBox(height: 4),
        Text(value, style: const TextStyle(color: AppColors.textPrimary, fontSize: 13, fontWeight: FontWeight.w600)),
      ],
    );
  }
}

class _PlayTypeTabs extends StatelessWidget {
  final PlayGameController controller;
  const _PlayTypeTabs({required this.controller});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: List.generate(controller.activePlayTypes.length, (i) {
          final selected = controller.activeTabIndex == i;
          final type = controller.activePlayTypes[i];
          final isCopyPaste = type == 'panel' && i == controller.activePlayTypes.length - 1;
          return Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 3),
              child: InkWell(
                onTap: () => controller.selectTab(i),
                borderRadius: BorderRadius.circular(10),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 180),
                  padding: const EdgeInsets.symmetric(vertical: 10),
                  decoration: BoxDecoration(
                    color: selected ? AppColors.success : AppColors.cardSecondary,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Center(
                    child: Text(
                      isCopyPaste ? 'COPY PASTE' : GamePlayConfig.labelFor(type),
                      style: TextStyle(
                        color: selected ? Colors.white : AppColors.textSecondary,
                        fontSize: 12,
                        fontWeight: selected ? FontWeight.w800 : FontWeight.w500,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          );
        }),
      ),
    );
  }
}

class _EntryForm extends StatelessWidget {
  final PlayGameController controller;
  final TextEditingController numberController;
  final TextEditingController amountController;
  const _EntryForm({required this.controller, required this.numberController, required this.amountController});

  String? _validate() {
    final type = controller.activePlayTypes[controller.activeTabIndex];
    final digits = GamePlayConfig.digitsFor(type);
    final num = numberController.text.trim();
    if (num.isEmpty) return 'Enter your number.';
    if (num.length != digits) return '$type needs exactly $digits digit(s).';
    final amt = amountController.text.trim();
    if (amt.isEmpty) return 'Enter an amount.';
    final value = int.tryParse(amt);
    if (value == null || value <= 0) return 'Amount must be a positive whole number.';
    if (value < controller.config.minStake) return 'Minimum stake is ${controller.config.minStake}.';
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final type = controller.activePlayTypes[controller.activeTabIndex];
    final digits = GamePlayConfig.digitsFor(type);
    final error = _validate();
    final canSave = error == null;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: numberController,
                  keyboardType: TextInputType.number,
                  maxLength: digits,
                  onChanged: (_) => setState(() {}),
                  style: AppTextStyles.cardTitle.copyWith(color: AppColors.textPrimary),
                  decoration: InputDecoration(
                    labelText: 'Number (${GamePlayConfig.labelFor(type)})',
                    labelStyle: const TextStyle(color: AppColors.textSecondary),
                    hintText: digits == 1 ? '0–9' : (digits == 3 ? 'e.g. 123' : 'e.g. 12'),
                    hintStyle: const TextStyle(color: AppColors.textMuted),
                    border: const OutlineInputBorder(),
                    enabledBorder: OutlineInputBorder(borderSide: BorderSide(color: AppColors.border)),
                    focusedBorder: OutlineInputBorder(borderSide: const BorderSide(color: AppColors.success)),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: TextField(
                  controller: amountController,
                  keyboardType: TextInputType.number,
                  onChanged: (_) => setState(() {}),
                  style: AppTextStyles.cardTitle.copyWith(color: AppColors.textPrimary),
                  decoration: InputDecoration(
                    labelText: 'Amount (pts)',
                    labelStyle: const TextStyle(color: AppColors.textSecondary),
                    hintText: 'e.g. 50',
                    hintStyle: const TextStyle(color: AppColors.textMuted),
                    border: const OutlineInputBorder(),
                    enabledBorder: OutlineInputBorder(borderSide: BorderSide(color: AppColors.border)),
                    focusedBorder: OutlineInputBorder(borderSide: const BorderSide(color: AppColors.success)),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: ElevatedButton(
                  onPressed: canSave
                      ? () {
                          controller.addEntry(
                            selection: numberController.text.trim(),
                            pointsStaked: int.tryParse(amountController.text.trim()) ?? 0,
                          );
                          numberController.clear();
                          amountController.clear();
                        }
                      : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.success,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                  child: const Text('Save', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
                ),
              ),
              const SizedBox(width: 10),
              if (error != null && (numberController.text.isNotEmpty || amountController.text.isNotEmpty))
                Padding(
                  padding: const EdgeInsets.only(top: 6),
                  child: Text(error!, style: const TextStyle(color: AppColors.error, fontSize: 12)),
                ),
            ],
          ),
        ],
      ),
    );
  }
}

class _CopyPastePanel extends StatefulWidget {
  final PlayGameController controller;
  final TextEditingController pasteController;
  const _CopyPastePanel({required this.controller, required this.pasteController});

  @override
  State<_CopyPastePanel> createState() => _CopyPastePanelState();
}

class _CopyPastePanelState extends State<_CopyPastePanel> {
  List<String> _invalidLines = [];
  int _parsedCount = 0;

  void _parse() {
    final type = widget.controller.activePlayTypes[widget.controller.activeTabIndex];
    final digits = GamePlayConfig.digitsFor(type);
    final raw = widget.pasteController.text;
    final lines = raw.split('\n').map((l) => l.trim()).where((l) => l.isNotEmpty).toList();

    _invalidLines = [];
    _parsedCount = 0;
    final newEntries = <WagerEntry>[];

    for (final line in lines) {
      // Support "123 50" (number + amount) or bare "123" (default amount).
      final parts = line.split(RegExp(r'\s+'));
      final num = parts.first;
      final amt = int.tryParse(parts.length > 1 ? parts[1] : '') ?? 50;

      if (num.length != digits || !RegExp(r'^\d+$').hasMatch(num)) {
        _invalidLines.add(line);
        continue;
      }
      if (amt < widget.controller.config.minStake) {
        _invalidLines.add(line);
        continue;
      }
      _parsedCount++;
      newEntries.add(WagerEntry(
        uid: '$type-${num}-${amt}-${DateTime.now().microsecondsSinceEpoch}-${newEntries.length}',
        playType: type,
        selection: num,
        pointsStaked: amt,
        sourceGameId: widget.controller.gameId,
      ));
    }

    setState(() {});
    if (newEntries.isNotEmpty) {
      widget.controller.addEntries(newEntries);
      widget.controller.dedupeCurrent();
    }
    widget.pasteController.clear();
  }

  @override
  Widget build(BuildContext context) {
    final type = widget.controller.activePlayTypes[widget.controller.activeTabIndex];
    final digits = GamePlayConfig.digitsFor(type);
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Paste one ${GamePlayConfig.labelFor(type).toLowerCase()} entry per line.',
            style: TextStyle(color: AppColors.textMuted, fontSize: 12),
          ),
          const SizedBox(height: 8),
          TextField(
            controller: widget.pasteController,
            minLines: 4,
            maxLines: 8,
            keyboardType: TextInputType.number,
            style: const TextStyle(color: AppColors.textPrimary, fontSize: 14, fontFamily: 'monospace'),
            decoration: InputDecoration(
              hintText: '$digits-digit lines, optionally "number amount"\ne.g.  12\n     34 80',
              hintStyle: const TextStyle(color: AppColors.textMuted),
              border: const OutlineInputBorder(),
              enabledBorder: OutlineInputBorder(borderSide: BorderSide(color: AppColors.border)),
              focusedBorder: OutlineInputBorder(borderSide: const BorderSide(color: AppColors.success)),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: ElevatedButton(
                  onPressed: widget.pasteController.text.trim().isNotEmpty ? _parse : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.success,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                  child: const Text('Parse & Add', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
                ),
              ),
            ],
          ),
          if (_parsedCount > 0)
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Text('Added $_parsedCount entr${_parsedCount == 1 ? 'y' : 'ies'}.', style: const TextStyle(color: AppColors.success, fontSize: 12)),
            ),
          if (_invalidLines.isNotEmpty) ...[
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: AppColors.error.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Skipped ${_invalidLines.length} invalid line(s):', style: const TextStyle(color: AppColors.error, fontSize: 12, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 4),
                  ..._invalidLines.map((l) => Text('• $l', style: const TextStyle(color: AppColors.textSecondary, fontSize: 12, fontFamily: 'monospace'))),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _SavedEntriesTable extends StatelessWidget {
  final PlayGameController controller;
  const _SavedEntriesTable({required this.controller});

  @override
  Widget build(BuildContext context) {
    final entries = controller.currentEntries;
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 12, 14, 6),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('SAVED ENTRIES', style: const TextStyle(color: AppColors.textMuted, fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 1)),
                if (entries.isNotEmpty)
                  Text('${entries.length} · ${controller.totalStake} pts', style: const TextStyle(color: AppColors.gold, fontSize: 12, fontWeight: FontWeight.w700)),
              ],
            ),
          ),
          if (entries.isEmpty)
            Padding(
              padding: const EdgeInsets.all(20),
              child: Center(
                child: Column(
                  children: [
                    Icon(Icons.inbox_rounded, size: 32, color: AppColors.textMuted.withValues(alpha: 0.5)),
                    const SizedBox(height: 8),
                    const Text('No entries yet', style: TextStyle(color: AppColors.textMuted, fontSize: 13)),
                  ],
                ),
              ),
            )
          else
            Column(
              children: [
                for (final e in entries)
                  Dismissible(
                    key: ValueKey(e.uid),
                    direction: DismissDirection.endToStart,
                    onDismissed: (_) => controller.removeEntry(e),
                    background: Container(
                      alignment: Alignment.centerRight,
                      padding: const EdgeInsets.only(right: 16),
                      color: AppColors.error.withValues(alpha: 0.2),
                      child: const Icon(Icons.delete_rounded, color: AppColors.error),
                    ),
                    child: Container(
                      margin: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      decoration: BoxDecoration(
                        color: AppColors.cardSecondary,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: Text(
                              e.selection,
                              style: const TextStyle(color: AppColors.goldBright, fontSize: 15, fontWeight: FontWeight.w700, fontFamily: 'monospace'),
                            ),
                          ),
                          Text('${e.pointsStaked} pts', style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                          const SizedBox(width: 8),
                          IconButton(
                            icon: const Icon(Icons.delete_outline_rounded, color: AppColors.textMuted, size: 18),
                            onPressed: () => controller.removeEntry(e),
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
        ],
      ),
    );
  }
}

class _SubmitBar extends StatelessWidget {
  final PlayGameController controller;
  const _SubmitBar({required this.controller});

  Future<void> _confirm(BuildContext context) async {
    final c = context.read<PlayGameController>();
    if (c.currentEntries.isEmpty) return;

    final total = c.totalStake;
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.card,
        title: const Text('Confirm submission', style: TextStyle(color: AppColors.textPrimary)),
        content: Text(
          'Place ${c.currentEntries.length} bet(s) on ${c.activePlayTypes[c.activeTabIndex].toUpperCase()} for a total of $total pts?',
          style: const TextStyle(color: AppColors.textSecondary),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.success),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Submit', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
    if (ok != true) return;

    await c.submitAll();
    if (context.mounted && c.errorMessage == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Submitted. Check "My Plays" for status.'), backgroundColor: AppColors.success),
      );
    } else if (context.mounted && c.errorMessage != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(c.errorMessage!), backgroundColor: AppColors.error),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = context.read<PlayGameController>();
    final canSubmit = c.currentEntries.isNotEmpty && !c.submitting;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: [
          Expanded(
            child: ElevatedButton.icon(
              onPressed: canSubmit ? () => _confirm(context) : null,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.success,
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
              icon: c.submitting
                  ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Icon(Icons.send_rounded, color: Colors.white, size: 18),
              label: Text(
                c.submitting ? 'Submitting…' : 'Submit (${c.currentEntries.length})',
                style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w800),
              ),
            ),
          ),
          const SizedBox(width: 10),
          SizedBox(
            width: 120,
            child: OutlinedButton(
              onPressed: () => context.push(RouteNames.results),
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.gold,
                side: BorderSide(color: AppColors.gold.withValues(alpha: 0.4)),
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
              child: const Text('Results', style: TextStyle(fontWeight: FontWeight.w700)),
            ),
          ),
        ],
      ),
    );
  }
}

class _MessageBody extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;
  const _MessageBody({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline_rounded, size: 48, color: AppColors.error.withValues(alpha: 0.5)),
            const SizedBox(height: 12),
            Text(message, textAlign: TextAlign.center, style: const TextStyle(color: AppColors.textSecondary, fontSize: 14)),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: onRetry,
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.success),
              child: const Text('Retry', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
            ),
          ],
        ),
      ),
    );
  }
}
