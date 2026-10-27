import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:shri_ji_bazaar/core/theme/app_colors.dart';
import 'package:shri_ji_bazaar/core/theme/app_text_styles.dart';
import 'package:shri_ji_bazaar/core/routes/route_names.dart';
import '../../../../core/widgets/sidebar_toggle.dart';
import '../../../../core/network/api_service.dart';
import '../../domain/entities/banner_entity.dart';
import '../../domain/entities/game_entity.dart';
import '../../domain/entities/game_detail_entity.dart';
import '../controllers/home_controller.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  int _currentBanner = 0;
  Timer? _timer;
  Timer? _refreshTimer;

  final ApiService _api = ApiService();
  Map<String, dynamic>? _liveMarket;
  List<dynamic> _recentResults = [];
  List<GameEntity> _allGames = [];
  bool _loading = true;
  bool _loadFailed = false;
  String? _selectedGameId;
  GameDetailEntity? _selectedGame;
  bool _gameDetailsLoading = false;

  @override
  void initState() {
    super.initState();
    _loadData();
    _startTimer();
  }

  @override
  void dispose() {
    _timer?.cancel();
    _refreshTimer?.cancel();
    super.dispose();
  }

  Future<void> _loadData() async {
    final controller = Provider.of<HomeController>(context, listen: false);
    await controller.loadHomeData();
    await _loadAllData();
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) setState(() {});
    });
    _refreshTimer = Timer.periodic(const Duration(seconds: 30), (_) {
      _loadData();
    });
  }

  Future<void> _loadAllData() async {
    setState(() => _loading = true);
    try {
      final results = await Future.wait([
        _api.get('/rounds/active'),
        _api.get('/results/latest', queryParameters: {'limit': 10}),
        _api.get('/games'),
      ]);

      final activeData = results[0] as Map<String, dynamic>?;
      final resultsData = results[1] as List<dynamic>? ?? [];
      var gamesData = results[2] as List<dynamic>? ?? <dynamic>[];

      // Show real data from the DB. Fallback only when the whole request
      // failed (offline / wrong URL), NOT when the DB is genuinely empty.
      // (To re-add a hardcoded fallback for offline demos, see git history
      // of this file — it was removed because it masked the empty live DB.)
      //
      // No "upcoming markets" list: it rendered ~20 days of open rounds and
      // buried the games. The games section is the focus; each game card's
      // play screen has its own date selector for future markets.

      final games = gamesData.map((g) => GameEntity(
        id: g['id'] as String,
        name: g['name'] as String,
        slug: g['slug'] as String,
        description: g['description'] as String? ?? '',
        image: g['image'] as String? ?? '',
        openingTime: g['opening_time'] as String? ?? '',
        closingTime: g['closing_time'] as String? ?? '',
        resultTime: g['result_time'] as String? ?? '',
        status: g['status'] as String? ?? 'active',
        isPopular: g['is_popular'] as bool? ?? false,
        sortOrder: g['sort_order'] as int? ?? 0,
        createdAt: g['created_at'] is String ? DateTime.parse(g['created_at'] as String) : DateTime.now(),
        updatedAt: g['updated_at'] is String ? DateTime.parse(g['updated_at'] as String) : DateTime.now(),
      )).toList();

      if (mounted) {
        setState(() {
          _liveMarket = activeData;
          _recentResults = resultsData;
          _allGames = games;
          _loading = false;
          _loadFailed = false;
        });
      }
    } catch (e) {
      // Backend unreachable (offline / dropped USB tunnel): stop the spinner
      // and surface a retry banner instead of an empty, silent page.
      if (mounted) {
        setState(() {
          _loading = false;
          _loadFailed = true;
        });
      }
    }
  }

  Future<void> _loadGameDetail(String gameId) async {
    if (_selectedGameId == gameId && _selectedGame != null) {
      setState(() {
        _selectedGameId = null;
        _selectedGame = null;
      });
      return;
    }
    setState(() {
      _selectedGameId = gameId;
      _gameDetailsLoading = true;
      _selectedGame = null;
    });

    try {
      final data = await _api.get('/games/$gameId');
      final roundsList = (data['rounds'] as List<dynamic>? ?? []);
      final rounds = roundsList.map((r) {
        return RoundEntity(
          id: r['id'] as String,
          gameId: r['game_id'] as String,
          roundNumber: r['round_number'] as String,
          startTime: r['start_time'] as String,
          endTime: r['end_time'] as String,
          result: r['result'] as String?,
          status: r['status'] as String,
          createdAt: DateTime.parse(r['created_at'] as String),
          updatedAt: DateTime.parse(r['updated_at'] as String),
        );
      }).toList();

      if (mounted) {
        setState(() {
          _selectedGame = GameDetailEntity(
            id: data['id'] as String,
            name: data['name'] as String,
            slug: data['slug'] as String,
            description: data['description'] as String? ?? '',
            image: data['image'] as String? ?? '',
            openingTime: data['opening_time'] as String? ?? '',
            closingTime: data['closing_time'] as String? ?? '',
            resultTime: data['result_time'] as String? ?? '',
            status: data['status'] as String? ?? 'active',
            isPopular: data['is_popular'] as bool? ?? false,
            sortOrder: data['sort_order'] as int? ?? 0,
            createdAt: DateTime.parse(data['created_at'] as String),
            updatedAt: DateTime.parse(data['updated_at'] as String),
            rounds: rounds,
          );
          _gameDetailsLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _gameDetailsLoading = false);
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

  void _onPlayGame(String gameId, String gameName) {
    // Open the full Play Game screen for this specific game.
    context.push(RouteNames.playGame, extra: {'gameId': gameId, 'gameName': gameName});
  }

  /// Opens a wager bottom sheet so the user can place a bet on a game's
  /// currently-open round. The backend resolves the open round when no
  /// roundId is passed.
  void _openWagerSheet(String gameId) {
    // The Play button now goes to the full Play Game screen; this sheet is
    // kept only for the Live Market quick-play button.
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) => _WagerSheet(gameId: gameId, api: _api),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Consumer<HomeController>(
          builder: (context, homeController, _) {
            return RefreshIndicator(
              onRefresh: _loadData,
              child: ListView(
                padding: EdgeInsets.zero,
                children: [
                  _buildHeader(context, homeController),
                  const SizedBox(height: 12),
                  if (_loadFailed)
                    _UnreachableBanner(onRetry: _loadData),
                  _buildBannerCarousel(homeController.banners),
                  const SizedBox(height: 16),
                  _buildActionButtons(),
                  const SizedBox(height: 16),
                  _buildLiveMarketSection(),
                  const SizedBox(height: 16),
                  // No "UPCOMING MARKET / WAIT" list here: it rendered 20+ days
                  // of open rounds and buried the games. The games section
                  // below is the focus — pick a game, use its date selector.
                  _buildGamesSection(),
                  if (_selectedGameId != null && _gameDetailsLoading)
                    const Padding(
                      padding: EdgeInsets.all(24),
                      child: Center(child: CircularProgressIndicator(color: AppColors.success)),
                    )
                  else if (_selectedGame != null)
                    _buildGameDetailsCard(_selectedGame!),
                  const SizedBox(height: 80),
                ],
              ),
            );
          },
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _loadData,
        backgroundColor: AppColors.goldDark,
        shape: const CircleBorder(),
        child: const Icon(Icons.refresh_rounded, color: Colors.white, size: 22),
      ),
    );
  }

  Widget _buildHeader(BuildContext context, HomeController controller) {
    final points = controller.points?.balance ?? 0;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: const BoxDecoration(
        color: AppColors.card,
        border: Border(bottom: BorderSide(color: AppColors.border)),
      ),
      child: Row(
        children: [
          const SidebarToggle(),
          const SizedBox(width: 8),
          // App logo in the top bar
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: Image.asset(
              'assets/logos/logo.webp',
              width: 36,
              height: 36,
              fit: BoxFit.cover,
              // New asset registration won't show until a rebuild; this keeps
              // the top bar usable (gold circle) instead of a pink error box.
              errorBuilder: (context, error, stackTrace) => Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(color: AppColors.gold, borderRadius: BorderRadius.circular(8)),
                child: Icon(Icons.shield_rounded, color: Colors.white, size: 18),
              ),
            ),
          ),
          const SizedBox(width: 10),
          Text(
            'SHREE JI BAZAR',
            style: AppTextStyles.appName.copyWith(
              color: AppColors.gold,
              fontSize: 18,
              letterSpacing: 2,
            ),
          ),
          const Spacer(),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: AppColors.gold.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.gold.withValues(alpha: 0.3)),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text('₹ ', style: TextStyle(color: AppColors.gold, fontSize: 16, fontWeight: FontWeight.bold)),
                Text('${points}', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBannerCarousel(List<BannerEntity> banners) {
    if (banners.isEmpty) {
      return Container(
        margin: const EdgeInsets.symmetric(horizontal: 12),
        height: 120,
        decoration: BoxDecoration(
          color: AppColors.card,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border),
        ),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.image_outlined, size: 48, color: AppColors.gold.withValues(alpha: 0.3)),
              const SizedBox(height: 8),
              Text('No banners available', style: TextStyle(color: AppColors.textMuted, fontSize: 14)),
            ],
          ),
        ),
      );
    }

    return Column(
      children: [
        SizedBox(
          height: 120,
          child: PageView.builder(
            itemCount: banners.length,
            onPageChanged: (index) {
              setState(() => _currentBanner = index);
            },
            itemBuilder: (context, index) {
              final banner = banners[index];
              final hasImage = banner.image.isNotEmpty;
              return Container(
                margin: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(
                  color: AppColors.card,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.border),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(16),
                  child: hasImage
                      ? Image.network(
                          banner.image,
                          height: 120,
                          width: double.infinity,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stack) => _BannerFallback(banner: banner),
                        )
                      : _BannerFallback(banner: banner),
                ),
              );
            },
          ),
        ),
        if (banners.length > 1)
          Padding(
            padding: const EdgeInsets.only(top: 12, bottom: 4),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(banners.length, (index) {
                return AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  width: _currentBanner == index ? 20 : 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: _currentBanner == index ? AppColors.gold : AppColors.border,
                    borderRadius: BorderRadius.circular(4),
                  ),
                );
              }),
            ),
          ),
      ],
    );
  }

  Widget _buildActionButtons() {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: _ActionButton(
                label: 'Customer support',
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
      ],
    );
  }

  Widget _buildLiveMarketSection() {
    if (_loading)
      return const Center(child: Padding(padding: EdgeInsets.all(24), child: CircularProgressIndicator(color: AppColors.success)));
    else if (_liveMarket != null)
      return _buildLiveMarketCard(_liveMarket!);
    else
      return _buildEmptyMarketCard('No Live Market', 'WAITING', AppColors.warning);
  }

  Widget _buildGamesSection() {
    if (_allGames.isEmpty) {
      return _buildEmptyMarketCard('No Games Available', 'COMING SOON', AppColors.warning);
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Text('ALL GAMES', style: AppTextStyles.sectionHeading),
        ),
        const SizedBox(height: 10),
        ...List.generate(_allGames.length, (index) {
          final game = _allGames[index];
          final isSelected = _selectedGameId == game.id;
          return _buildGameCard(game, isSelected);
        }),
      ],
    );
  }

  Widget _buildGameCard(GameEntity game, bool isSelected) {
    final icon = _gameIcon(game.name);
    final isActive = game.status.toLowerCase() == 'active';
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isSelected ? AppColors.gold : AppColors.border),
      ),
      child: Column(
        children: [
          ListTile(
            leading: Container(
              width: 48,
              height: 48,
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF8A5A00), Color(0xFFD89B18)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.all(Radius.circular(12)),
              ),
              child: Icon(icon, color: Colors.white, size: 24),
            ),
            title: Text(game.name.toUpperCase(), style: AppTextStyles.cardTitle),
            subtitle: Row(
              children: [
                Container(
                  width: 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: isActive ? const Color(0xFF25C85A) : const Color(0xFFFFA726),
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  game.status.toUpperCase(),
                  style: AppTextStyles.bodySmall.copyWith(
                    color: isActive ? const Color(0xFF25C85A) : const Color(0xFFFFA726),
                  ),
                ),
              ],
            ),
            trailing: isActive
                ? ElevatedButton(
                    onPressed: () => _onPlayGame(game.id, game.name),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.success,
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                    ),
                    child: Text(isSelected ? 'Hide' : 'Play', style: const TextStyle(fontSize: 13)),
                  )
                : TextButton(onPressed: null, child: Text('Soon', style: AppTextStyles.caption)),
          ),
          if (isSelected && _selectedGame != null)
            _buildGameDetailsCard(_selectedGame!),
        ],
      ),
    );
  }

  Widget _buildGameDetailsCard(GameDetailEntity game) {
    final activeRounds = game.rounds.where((r) => r.status.toLowerCase() == 'active').toList();
    return Container(
      margin: const EdgeInsets.only(left: 16, right: 16, bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 80,
                height: 80,
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0xFF8A5A00), Color(0xFFD89B18)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.all(Radius.circular(20)),
                ),
                child: Icon(_gameIcon(game.name), size: 40, color: Colors.white),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(game.name.toUpperCase(), style: AppTextStyles.marketTitle),
                    const SizedBox(height: 4),
                    Text('Open: ${_formatAmPm(game.openingTime)}', style: AppTextStyles.caption),
                    Text('Close: ${_formatAmPm(game.closingTime)}', style: AppTextStyles.caption),
                    Text('Result: ${_formatAmPm(game.resultTime)}', style: AppTextStyles.caption),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text('Active Rounds', style: AppTextStyles.sectionHeading),
          const SizedBox(height: 10),
          if (activeRounds.isEmpty)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.card,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Center(child: Text('No active rounds', style: TextStyle(color: AppColors.textSecondary))),
            )
          else
            ...List.generate(activeRounds.length, (index) {
              final round = activeRounds[index];
              final entryFee = 50 * (index + 1);
              return Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.card,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Round ${round.roundNumber}', style: AppTextStyles.cardTitle),
                          const SizedBox(height: 4),
                          Text('${_formatAmPm(round.startTime)} - ${_formatAmPm(round.endTime)}', style: AppTextStyles.bodySmall),
                          Text('Entry: $entryFee pts', style: AppTextStyles.points.copyWith(fontSize: 14)),
                        ],
                      ),
                    ),
                    ElevatedButton(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('Joined ${game.name} - Round ${round.roundNumber}'),
                            backgroundColor: AppColors.success,
                          ),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.success,
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                      ),
                      child: const Text('Join', style: TextStyle(fontSize: 13)),
                    ),
                  ],
                ),
              );
            }),
        ],
      ),
    );
  }

  Widget _buildLiveMarketCard(Map<String, dynamic> market) {
    // Same shape as upcoming: the Supabase join returns the game under the
    // "games" key (verified against the live API). No hard-coded default name.
    String? liveName;
    liveName = market['game_name'] as String?;
    final nestedLive = market['games'];
    if (nestedLive is Map) liveName = nestedLive['name'] as String? ?? liveName;
    if (liveName == null || liveName.isEmpty) {
      liveName = market['game_name'] as String? ?? market['gameName'] as String?;
    }
    final name = (liveName ?? 'LIVE MARKET').toUpperCase();
    final timeLeft = _formatTimeLeft(market['end_time'] ?? market['endTime']);
    final lastResult = _getLastResultForGame(name);
    final resultTime = _formatAmPm(market['result_time'] ?? market['resultTime']);

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(name, style: AppTextStyles.marketTitle.copyWith(fontSize: 18)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                decoration: BoxDecoration(
                  color: AppColors.success.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.success.withValues(alpha: 0.4)),
                ),
                child: Text(
                  'RUNNING',
                  style: TextStyle(
                    color: AppColors.success,
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 1.5,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(timeLeft, style: AppTextStyles.cardTitle.copyWith(color: AppColors.goldBright, fontFamily: 'monospace', fontSize: 18)),
                    const SizedBox(height: 2),
                    Text('Time Left', style: AppTextStyles.caption.copyWith(color: AppColors.textSecondary)),
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
                  onPressed: () {
                    final gameId = market['game_id'] as String?;
                    if (gameId == null) return;
                    _openWagerSheet(gameId);
                  },
                  icon: const Icon(Icons.play_arrow_rounded, color: Colors.white, size: 20),
                  label: Text('Play', style: AppTextStyles.body.copyWith(color: Colors.white, fontWeight: FontWeight.w800)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyMarketCard(String label, String status, Color statusColor) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 12),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: AppTextStyles.marketTitle),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
            decoration: BoxDecoration(
              color: statusColor.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: statusColor.withValues(alpha: 0.4)),
            ),
            child: Text(
              status,
              style: TextStyle(
                color: statusColor,
                fontSize: 11,
                fontWeight: FontWeight.w700,
                letterSpacing: 1.5,
              ),
            ),
          ),
        ],
      ),
    );
  }

  /// Placeholder shown when a banner has no image (or the image fails to load).
  Widget _BannerFallback({required BannerEntity banner}) {
    return Container(
      height: 120,
      width: double.infinity,
      decoration: BoxDecoration(gradient: AppColors.goldGradient),
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          if (banner.title.isNotEmpty)
            Text(
              banner.title,
              style: AppTextStyles.bannerTitle,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          if (banner.description.isNotEmpty)
            Text(
              banner.description,
              style: AppTextStyles.body.copyWith(color: Colors.white70, fontSize: 13),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
        ],
      ),
    );
  }

  /// Bottom sheet: pick a play type + number, then place the wager.
  Widget _WagerSheet({required String gameId, required ApiService api}) {
    final controller = TextEditingController();
    String playType = 'single';
    bool submitting = false;
    String? error;

    Future<void> submit() async {
      final selection = controller.text.trim();
      if (selection.isEmpty) {
        setState(() => error = 'Enter your number first.');
        return;
      }
      setState(() {
        submitting = true;
        error = null;
      });
      try {
        await api.post('/wagers', data: {
          'gameId': gameId,
          'playType': playType,
          'selection': selection,
          'pointsStaked': 50,
          'idempotencyKey': DateTime.now().toIso8601String(),
        });
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Wager placed! Check "My Plays" for status.'), backgroundColor: AppColors.success),
          );
        }
        if (mounted) Navigator.of(context).pop();
      } on ApiException catch (e) {
        if (mounted) setState(() => error = e.message);
      }
    }

    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: AppColors.card,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Play type selector
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('PLAY TYPE', style: TextStyle(color: AppColors.textSecondary, fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 1)),
                Text(playType.toUpperCase(), style: const TextStyle(color: AppColors.gold, fontSize: 12, fontWeight: FontWeight.w700)),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                for (final type in ['single', 'double', 'jodi', 'panel'])
                  Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: _Chip(
                      label: type,
                      selected: playType == type,
                      onTap: () => setState(() => playType = type),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 16),
            const Text('YOUR NUMBER', style: TextStyle(color: AppColors.textSecondary, fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 1)),
            const SizedBox(height: 8),
            SizedBox(
              width: 120,
              child: TextField(
                controller: controller,
                keyboardType: TextInputType.number,
                maxLength: 3,
                style: AppTextStyles.cardTitle.copyWith(color: AppColors.textPrimary),
                decoration: InputDecoration(
                  counterText: '',
                  hintText: playType == 'single' ? '0–9' : playType == 'panel' ? 'e.g. 123' : 'e.g. 12',
                  hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 14),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                const Text('Stake', style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                const SizedBox(width: 8),
                Text('50 pts', style: AppTextStyles.points.copyWith(fontSize: 14, color: AppColors.gold)),
              ],
            ),
            if (error != null) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: AppColors.error.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
                child: Text(error!, style: const TextStyle(color: AppColors.error, fontSize: 13)),
              ),
            ],
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: submitting ? null : submit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.success,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                child: submitting
                    ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Text('Place Wager', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w800)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _Chip({required String label, required bool selected, required VoidCallback onTap}) {
    return Material(
      color: selected ? AppColors.success : AppColors.cardSecondary,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
          child: Text(
            label,
            style: TextStyle(
              color: selected ? Colors.white : AppColors.textPrimary,
              fontSize: 13,
              fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
            ),
          ),
        ),
      ),
    );
  }

  IconData _gameIcon(String name) {
    switch (name.toLowerCase()) {
      case 'lucky 7':
        return Icons.casino_rounded;
      case 'golden wheel':
        return Icons.circle_rounded;
      case 'diamond rush':
        return Icons.diamond_rounded;
      case 'royal flush':
        return Icons.emoji_events_rounded;
      case 'mega draw':
        return Icons.star_rounded;
      case 'lucky star':
        return Icons.auto_awesome_rounded;
      default:
        return Icons.casino_rounded;
    }
  }
}

/// Shown at the top of the home page when the last data load failed (e.g. the
/// backend is unreachable / USB tunnel dropped). Gives the user an explicit
/// reason + a retry action instead of a silent empty page.
class _UnreachableBanner extends StatelessWidget {
  final VoidCallback onRetry;
  const _UnreachableBanner({required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.error.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.error.withValues(alpha: 0.4)),
      ),
      child: Row(
        children: [
          const Icon(Icons.cloud_off_rounded, color: AppColors.error, size: 22),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Can’t reach the server',
                  style: TextStyle(color: AppColors.error, fontSize: 13, fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 2),
                Text(
                  'Check your connection and try again.',
                  style: TextStyle(color: AppColors.textSecondary, fontSize: 12),
                ),
              ],
            ),
          ),
          TextButton(
            onPressed: onRetry,
            style: TextButton.styleFrom(
              foregroundColor: AppColors.error,
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              minimumSize: const Size(44, 36),
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
            child: const Text('Retry', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
          ),
        ],
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
