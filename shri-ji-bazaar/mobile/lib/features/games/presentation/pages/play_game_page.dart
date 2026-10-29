import 'dart:async';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:shri_ji_bazaar/core/network/api_service.dart';
import 'package:shri_ji_bazaar/core/routes/route_names.dart';
import 'package:shri_ji_bazaar/core/theme/app_colors.dart';
import 'package:shri_ji_bazaar/core/theme/app_text_styles.dart';
import '../../domain/game_play_config.dart';
import '../controllers/play_game_controller.dart';

/// The Play Game screen, matching the reference desi-jodi layout:
///   * a green header with the game name
///   * a black ticking "last time" banner
///   * three tabs — Jodi (00–99 grid + Andar Haruf 0–9 row), Crossing
///     (digit + amount), and Copy Paste (number + amount + With/Without Palti)
///   * a fixed bottom bar with the total stake (₹) and a SUBMIT button
class PlayGamePage extends StatefulWidget {
  final String gameId;

  const PlayGamePage({super.key, required this.gameId});

  @override
  State<PlayGamePage> createState() => _PlayGamePageState();
}

class _PlayGamePageState extends State<PlayGamePage> {
  late final PlayGameController _controller;
  late final TextEditingController _digitController;
  late final TextEditingController _amountController;
  late final TextEditingController _paltiController;

  final int _defaultStake = 50;
  Timer? _tick;

  @override
  void initState() {
    super.initState();
    _digitController = TextEditingController();
    _amountController = TextEditingController();
    _paltiController = TextEditingController();
    _controller = PlayGameController(gameId: widget.gameId, api: ApiService());
    _controller.load();
    _tick = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) setState(() {}); // drives the last-time countdown
    });
  }

  @override
  void didUpdateWidget(PlayGamePage oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.gameId != widget.gameId) {
      _controller.dispose();
      _controller = PlayGameController(gameId: widget.gameId, api: ApiService());
      _digitController.clear();
      _amountController.clear();
      _paltiController.clear();
      _controller.load();
    }
  }

  @override
  void dispose() {
    _tick?.cancel();
    _digitController.dispose();
    _amountController.dispose();
    _paltiController.dispose();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Expose the page-local controller to the Consumer widgets below (the
    // route does not register a global provider for it). It is a
    // ChangeNotifier, so it must be wrapped with ChangeNotifierProvider —
    // plain Provider.value only accepts immutable values.
    return ChangeNotifierProvider<PlayGameController>.value(
      value: _controller,
      child: Scaffold(
        backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.success,
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          onPressed: () => context.pop(),
          icon: const Icon(Icons.arrow_back_rounded, color: Colors.white),
        ),
        title: Consumer<PlayGameController>(
          builder: (context, c, _) => Text(
            _gameName(c),
            style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w800),
          ),
        ),
      ),
      body: Consumer<PlayGameController>(
        builder: (context, c, _) {
          if (c.loading && c.game == null) {
            return Center(child: CircularProgressIndicator(color: AppColors.success));
          }
          if (c.errorMessage != null && c.game == null) {
            return _MessageBody(message: c.errorMessage!, onRetry: () => c.load());
          }
          return SafeArea(
            child: Column(
              children: [
                _LastTimeBanner(controller: c),
                _DateSelector(controller: c),
                _TabBar(controller: c),
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (c.canBet && !c.notStartedYet && !c.marketClosed) ...[
                          _buildTabContent(c),
                          const SizedBox(height: 12),
                        ] else if (!c.canBet && c.marketClosed)
                          Padding(
                            padding: const EdgeInsets.all(40),
                            child: Center(
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.lock_clock, size: 40, color: AppColors.warning),
                                  const SizedBox(height: 12),
                                  Text(
                                    c.marketClosedMessage(),
                                    textAlign: TextAlign.center,
                                    style: TextStyle(color: AppColors.textMuted, fontSize: 13),
                                  ),
                                ],
                              ),
                            ),
                          )
                        else if (c.canBet && c.notStartedYet)
                          Padding(
                            padding: const EdgeInsets.all(40),
                            child: Center(
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.timer_outlined, size: 40, color: AppColors.warning),
                                  const SizedBox(height: 12),
                                  Text(
                                    c.notStartedYetMessage(),
                                    textAlign: TextAlign.center,
                                    style: TextStyle(color: AppColors.textMuted, fontSize: 13),
                                  ),
                                ],
                              ),
                            ),
                          )
                        else
                          Padding(
                            padding: const EdgeInsets.all(40),
                            child: Center(
                              child: Text(
                                'No open market yet for this date.\nTry today or another date.',
                                textAlign: TextAlign.center,
                                style: TextStyle(color: AppColors.textMuted, fontSize: 13),
                              ),
                            ),
                          ),
                        _SavedEntriesTable(controller: c),
                        const SizedBox(height: 80),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
        bottomNavigationBar: _SubmitBar(
          controller: _controller,
          defaultStake: _defaultStake,
          onSubmitted: _onSubmitted,
        ),
      ),
    );
  }

  Widget _buildTabContent(PlayGameController c) {
    final tab = c.activePlayTypes[c.activeTabIndex];
    switch (tab) {
      case 'crossing':
        return _CrossingPanel(
          controller: c,
          digitController: _digitController,
          amountController: _amountController,
          defaultStake: _defaultStake,
        );
      case 'palti':
        return _CopyPastePanel(
          controller: c,
          numberController: _paltiController,
          amountController: _amountController,
          defaultStake: _defaultStake,
        );
      case 'jodi':
      default:
        return _JodiPanel(controller: c, defaultStake: _defaultStake);
    }
  }

  String _gameName(PlayGameController c) {
    final name = c.game?['name'] as String?;
    return (name?.isNotEmpty == true ? name : 'GAME')!.toUpperCase();
  }

  void _onSubmitted() {
    if (!mounted) return;
    if (_controller.errorMessage == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Submitted. Check "My Plays" for status.'), backgroundColor: AppColors.success),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(_controller.errorMessage!), backgroundColor: AppColors.error),
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Last-time banner (black bar with ticking countdown to the result time)
// ---------------------------------------------------------------------------
class _LastTimeBanner extends StatelessWidget {
  final PlayGameController controller;
  const _LastTimeBanner({required this.controller});

  String _format(DateTime? end) {
    if (end == null) return '--:--:--';
    final diff = end.difference(DateTime.now());
    if (diff.isNegative) return '00:00:00';
    final h = diff.inHours.toString().padLeft(2, '0');
    final m = (diff.inMinutes % 60).toString().padLeft(2, '0');
    final s = (diff.inSeconds % 60).toString().padLeft(2, '0');
    return '$h:$m:$s';
  }

  @override
  Widget build(BuildContext context) {
    // Only show a round's time when a bettable round exists for this view.
    final hasDateRound = controller.dateRound != null;
    final round = hasDateRound ? controller.dateRound : controller.activeRound;
    if (round == null) {
      return Container(
        color: Colors.black,
        padding: const EdgeInsets.symmetric(vertical: 10),
        alignment: Alignment.center,
        child: const Text(
          'NO MARKET YET FOR THIS DATE',
          style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w700),
        ),
      );
    }
    final raw = round['end_time'] ?? round['endTime'];
    DateTime? end = raw is String ? DateTime.tryParse(raw) : raw is DateTime ? raw : null;
    // A live round has a ticking countdown; a date-wise round just shows the
    // market's closing clock.
    final isLive = !hasDateRound;
    return Container(
      color: Colors.black,
      padding: const EdgeInsets.symmetric(vertical: 10),
      alignment: Alignment.center,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Text(
            'मोटी जोड़ी लसट टाइम : ',
            style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w700),
          ),
          Text(
            isLive ? _format(end) : _formatClock(end),
            style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w800, fontFamily: 'monospace'),
          ),
        ],
      ),
    );
  }

  String _formatClock(DateTime? end) {
    if (end == null) return '--:--:--';
    final h = end.hour % 12 == 0 ? 12 : end.hour % 12;
    final m = end.minute.toString().padLeft(2, '0');
    final ampm = end.hour < 12 ? 'AM' : 'PM';
    return '$h:$m $ampm';
  }
}

// ---------------------------------------------------------------------------
// Date selector (Today / Tomorrow / custom) for the date-wise markets
// ---------------------------------------------------------------------------
class _DateSelector extends StatelessWidget {
  final PlayGameController controller;
  const _DateSelector({required this.controller});

  String _fmt(String d) {
    final parts = d.split('-');
    if (parts.length != 3) return d;
    final dt = DateTime(int.tryParse(parts[0])!, int.tryParse(parts[1])!, int.tryParse(parts[2])!);
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return '${dt.day} ${months[dt.month - 1]}';
  }

  String _tomorrowOf(String today) {
    final d = DateTime.parse(today).add(const Duration(days: 1));
    return '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final today = controller.selectedDate;
    final opts = <String, String>{
      'TODAY': today,
      'TOMORROW': _tomorrowOf(today),
    };

    Future<void> _pick() async {
      final picked = await showDatePicker(
        context: context,
        initialDate: DateTime.parse(today),
        firstDate: DateTime.now().subtract(const Duration(days: 1)),
        lastDate: DateTime.now().add(const Duration(days: 30)),
      );
      if (picked != null && context.mounted) {
        final iso = '${picked.year}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}';
        await controller.selectDate(iso);
      }
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      child: Row(
        children: [
          Text('MARKET DATE : ', style: TextStyle(color: AppColors.textMuted, fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 1)),
          Expanded(
            child: DropdownButton<String>(
              value: opts.entries.where((e) => e.value == today).firstOrNull?.key,
              items: opts.entries
                  .map((e) => DropdownMenuItem(
                        value: e.key,
                        child: Text(
                          e.key == 'TODAY' ? 'TODAY' : 'TOMORROW · ${_fmt(e.value)}',
                          style: TextStyle(color: AppColors.textPrimary, fontSize: 13, fontWeight: FontWeight.w600),
                        ),
                      ))
                  .toList(),
              hint: Text(_fmt(today), style: TextStyle(color: AppColors.textPrimary, fontSize: 13)),
              underline: const SizedBox.shrink(),
              onChanged: (v) {
                if (v == null) return;
                controller.selectDate(opts[v]!);
              },
            ),
          ),
          IconButton(
            icon: Icon(Icons.calendar_month_rounded, color: AppColors.gold, size: 20),
            onPressed: _pick,
            tooltip: 'Pick a date',
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Tab bar (Jodi / Crossing / Copy Paste)
// ---------------------------------------------------------------------------
class _TabBar extends StatelessWidget {
  final PlayGameController controller;
  const _TabBar({required this.controller});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      child: Row(
        children: List.generate(controller.activePlayTypes.length, (i) {
          final selected = controller.activeTabIndex == i;
          final tab = controller.activePlayTypes[i];
          return Expanded(
            child: InkWell(
              onTap: () => controller.selectTab(i),
              borderRadius: BorderRadius.circular(8),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 180),
                padding: const EdgeInsets.symmetric(vertical: 10),
                decoration: BoxDecoration(
                  color: selected ? AppColors.success : AppColors.card,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: selected ? AppColors.success : AppColors.border),
                ),
                alignment: Alignment.center,
                child: Text(
                  GamePlayConfig.tabLabel(tab),
                  style: TextStyle(
                    color: selected ? Colors.white : AppColors.textSecondary,
                    fontSize: 13,
                    fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
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

// ---------------------------------------------------------------------------
// Jodi panel: 00–99 grid + Andar Haruf 0–9 row
// ---------------------------------------------------------------------------
class _JodiPanel extends StatelessWidget {
  final PlayGameController controller;
  final int defaultStake;
  const _JodiPanel({required this.controller, required this.defaultStake});

  Set<String> get _selectedJodi =>
      controller.currentEntries.where((e) => e.playType == 'jodi').map((e) => e.selection).toSet();
  Set<String> get _selectedSingle =>
      controller.currentEntries.where((e) => e.playType == 'single').map((e) => e.selection).toSet();

  void _toggle(String selection, String playType, Set<String> selected) {
    if (selected.contains(selection)) {
      controller.removeSelection(playType, selection);
    } else {
      // Pass the explicit play type so the Andar Haruf row creates a `single`
      // bet even though it lives inside the Jodi tab.
      controller.addEntry(selection: selection, pointsStaked: defaultStake, palti: false, playType: playType);
    }
  }

  @override
  Widget build(BuildContext context) {
    final jodiSelected = _selectedJodi;
    final singleSelected = _selectedSingle;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Jodi Numbers (00 - 99)', style: AppTextStyles.sectionHeading),
        const SizedBox(height: 10),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 10,
            mainAxisSpacing: 6,
            crossAxisSpacing: 6,
            childAspectRatio: 1.5,
          ),
          itemCount: 100,
          itemBuilder: (context, i) {
            final label = i.toString().padLeft(2, '0');
            return _NumberChip(
              label: label,
              selected: jodiSelected.contains(label),
              onTap: () => _toggle(label, 'jodi', jodiSelected),
            );
          },
        ),
        const SizedBox(height: 16),
        Text('Andar Haruf (अंदर)', style: AppTextStyles.sectionHeading),
        const SizedBox(height: 10),
        Row(
          children: List.generate(10, (i) {
            final label = '$i';
            return Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 3),
                child: _NumberChip(
                  label: label,
                  selected: singleSelected.contains(label),
                  onTap: () => _toggle(label, 'single', singleSelected),
                ),
              ),
            );
          }),
        ),
      ],
    );
  }
}

class _NumberChip extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback? onTap;
  const _NumberChip({required this.label, this.selected = false, this.onTap});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: selected ? AppColors.success : Color(0xFF2E5AAC),
      borderRadius: BorderRadius.circular(6),
      child: InkWell(
        borderRadius: BorderRadius.circular(6),
        onTap: onTap,
        child: Center(
          child: Text(
            label,
            style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w800),
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Crossing panel: digit + amount + SAVE
// ---------------------------------------------------------------------------
class _CrossingPanel extends StatelessWidget {
  final PlayGameController controller;
  final TextEditingController digitController;
  final TextEditingController amountController;
  final int defaultStake;

  const _CrossingPanel({
    required this.controller,
    required this.digitController,
    required this.amountController,
    required this.defaultStake,
  });

  void _save() {
    final digit = digitController.text.trim();
    final amt = int.tryParse(amountController.text.trim()) ?? defaultStake;
    if (digit.isEmpty) return;
    controller.addEntry(selection: digit, pointsStaked: amt);
    digitController.clear();
    amountController.clear();
  }

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: Listenable.merge([digitController, amountController]),
      builder: (context, _) {
        final canSave = digitController.text.trim().isNotEmpty;
        return Column(
          children: [
            _field(digitController, 'Enter Digit', digits: true),
            const SizedBox(height: 10),
            _field(amountController, 'Amount', digits: true),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: canSave ? _save : null,
                style: ElevatedButton.styleFrom(backgroundColor: AppColors.success, padding: EdgeInsets.symmetric(vertical: 12)),
                child: const Text('SAVE', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _field(TextEditingController c, String label, {bool digits = false}) {
    return TextField(
      controller: c,
      keyboardType: digits ? TextInputType.number : TextInputType.text,
      style: AppTextStyles.cardTitle.copyWith(color: AppColors.textPrimary),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: TextStyle(color: AppColors.textSecondary),
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        border: const OutlineInputBorder(),
        enabledBorder: OutlineInputBorder(borderSide: BorderSide(color: AppColors.border)),
        focusedBorder: OutlineInputBorder(borderSide: BorderSide(color: AppColors.success)),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Copy Paste panel: number + amount + With/Without Palti + SAVE
// ---------------------------------------------------------------------------
class _CopyPastePanel extends StatefulWidget {
  final PlayGameController controller;
  final TextEditingController numberController;
  final TextEditingController amountController;
  final int defaultStake;

  const _CopyPastePanel({
    required this.controller,
    required this.numberController,
    required this.amountController,
    required this.defaultStake,
  });

  @override
  State<_CopyPastePanel> createState() => _CopyPastePanelState();
}

class _CopyPastePanelState extends State<_CopyPastePanel> {
  bool _withPalti = true;

  void _save() {
    final num = widget.numberController.text.trim();
    final amt = int.tryParse(widget.amountController.text.trim()) ?? widget.defaultStake;
    if (num.isEmpty) return;
    widget.controller.addEntry(selection: num, pointsStaked: amt, palti: _withPalti);
    widget.numberController.clear();
    widget.amountController.clear();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        TextField(
          controller: widget.numberController,
          keyboardType: TextInputType.number,
          style: AppTextStyles.cardTitle.copyWith(color: AppColors.textPrimary),
          decoration: InputDecoration(
            labelText: 'Enter Number',
            labelStyle: TextStyle(color: AppColors.textSecondary),
            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            border: const OutlineInputBorder(),
            enabledBorder: OutlineInputBorder(borderSide: BorderSide(color: AppColors.border)),
            focusedBorder: OutlineInputBorder(borderSide: BorderSide(color: AppColors.success)),
          ),
        ),
        const SizedBox(height: 10),
        TextField(
          controller: widget.amountController,
          keyboardType: TextInputType.number,
          style: AppTextStyles.cardTitle.copyWith(color: AppColors.textPrimary),
          decoration: InputDecoration(
            labelText: 'Amount',
            labelStyle: TextStyle(color: AppColors.textSecondary),
            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            border: const OutlineInputBorder(),
            enabledBorder: OutlineInputBorder(borderSide: BorderSide(color: AppColors.border)),
            focusedBorder: OutlineInputBorder(borderSide: BorderSide(color: AppColors.success)),
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _PaltiToggle(label: 'With Palti', selected: _withPalti, onTap: () => setState(() => _withPalti = true)),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _PaltiToggle(label: 'Without Palti', selected: !_withPalti, onTap: () => setState(() => _withPalti = false)),
            ),
          ],
        ),
        const SizedBox(height: 12),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: widget.numberController.text.trim().isNotEmpty ? _save : null,
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.success, padding: EdgeInsets.symmetric(vertical: 12)),
            child: const Text('SAVE', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
          ),
        ),
      ],
    );
  }
}

class _PaltiToggle extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;
  const _PaltiToggle({required this.label, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: selected ? AppColors.success : AppColors.card,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: selected ? AppColors.success : AppColors.border),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(selected ? Icons.radio_button_checked : Icons.radio_button_off, size: 18, color: selected ? Colors.white : AppColors.textSecondary),
            const SizedBox(width: 8),
            Text(label, style: TextStyle(color: selected ? Colors.white : AppColors.textSecondary, fontWeight: FontWeight.w600, fontSize: 13)),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Saved entries table (per active tab)
// ---------------------------------------------------------------------------
class _SavedEntriesTable extends StatelessWidget {
  final PlayGameController controller;
  const _SavedEntriesTable({required this.controller});

  @override
  Widget build(BuildContext context) {
    final entries = controller.currentEntries;
    final tab = controller.activePlayTypes[controller.activeTabIndex];
    final playTypes = tab == 'jodi' ? {'jodi', 'single'} : {tab};

    // Only show entries belonging to this tab's play types so switching tabs
    // never mixes selections together.
    final visible = entries.where((e) => playTypes.contains(e.playType)).toList();

    return Container(
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
                Text('NUMBER  ·  AMOUNT  ·  ACTION', style: TextStyle(color: AppColors.textMuted, fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 1)),
                if (visible.isNotEmpty)
                  Text('${visible.length} · ${controller.totalStake} pts', style: TextStyle(color: AppColors.gold, fontSize: 12, fontWeight: FontWeight.w700)),
              ],
            ),
          ),
          if (visible.isEmpty)
            Padding(
              padding: const EdgeInsets.all(16),
              child: Center(child: Text('No entries yet. Tap numbers or use the forms above.', style: TextStyle(color: AppColors.textMuted, fontSize: 12))),
            )
          else
            Column(
              children: [
                for (final e in visible)
                  Dismissible(
                    key: ValueKey(e.uid),
                    direction: DismissDirection.endToStart,
                    onDismissed: (_) => controller.removeEntry(e),
                    background: Container(alignment: Alignment.centerRight, padding: EdgeInsets.only(right: 16), color: AppColors.error.withValues(alpha: 0.2), child: Icon(Icons.delete_rounded, color: AppColors.error)),
                    child: Container(
                      margin: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
                      decoration: BoxDecoration(color: AppColors.cardSecondary, borderRadius: BorderRadius.circular(8)),
                      child: Row(
                        children: [
                          Expanded(
                            child: Text(
                              '${e.selection}${e.palti ? ' (Palti)' : ''}',
                              style: TextStyle(color: AppColors.goldBright, fontSize: 15, fontWeight: FontWeight.w700, fontFamily: 'monospace'),
                            ),
                          ),
                          Text('${e.pointsStaked} pts', style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                          const SizedBox(width: 8),
                          IconButton(icon: Icon(Icons.delete_outline_rounded, color: AppColors.textMuted, size: 18), onPressed: () => controller.removeEntry(e)),
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

// ---------------------------------------------------------------------------
// Bottom submit bar: ₹ total + SUBMIT
// ---------------------------------------------------------------------------
class _SubmitBar extends StatelessWidget {
  final PlayGameController controller;
  final int defaultStake;
  final VoidCallback onSubmitted;
  const _SubmitBar({required this.controller, required this.defaultStake, required this.onSubmitted});

  Future<void> _confirm(BuildContext context) async {
    final c = context.read<PlayGameController>();
    if (c.currentEntries.isEmpty) return;
    final total = c.totalStake;
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.card,
        title: Text('Confirm submission', style: TextStyle(color: AppColors.textPrimary)),
        content: Text(
          'Place ${c.currentEntries.length} bet(s) on ${GamePlayConfig.tabLabel(c.activePlayTypes[c.activeTabIndex])} for a total of ₹$total?',
          style: TextStyle(color: AppColors.textSecondary),
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
    onSubmitted();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.card,
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
      child: Consumer<PlayGameController>(
        builder: (context, c, _) {
          final canSubmit = c.currentEntries.isNotEmpty && !c.submitting;
          return Row(
            children: [
              Text('₹${c.totalStake}', style: TextStyle(color: AppColors.textPrimary, fontSize: 22, fontWeight: FontWeight.w800)),
              const Spacer(),
              SizedBox(
                width: 140,
                height: 48,
                child: ElevatedButton(
                  onPressed: canSubmit ? () => _confirm(context) : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.success,
                    disabledBackgroundColor: AppColors.success.withValues(alpha: 0.4),
                  ),
                  child: c.submitting
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Text('SUBMIT', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w800)),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Error / retry body
// ---------------------------------------------------------------------------
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
            Text(message, textAlign: TextAlign.center, style: TextStyle(color: AppColors.textSecondary, fontSize: 14)),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: onRetry,
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.success),
              child: const Text('Retry', style: TextStyle(color: Colors.white)),
            ),
          ],
        ),
      ),
    );
  }
}
