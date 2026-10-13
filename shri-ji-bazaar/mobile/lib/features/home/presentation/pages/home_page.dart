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
  List<dynamic> _upcomingMarkets = [];
  List<dynamic> _recentResults = [];
  List<GameEntity> _allGames = [];
  bool _loading = true;
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
        _api.get('/rounds/upcoming'),
        _api.get('/results/latest', queryParameters: {'limit': 10}),
        _api.get('/games'),
      ]);

      final activeData = results[0] as Map<String, dynamic>?;
      final upcomingData = results[1] as List<dynamic>? ?? [];
      final resultsData = results[2] as List<dynamic>? ?? [];
      final gamesData = results[3] as List<dynamic>? ?? [];

      final upcomingWithNames = <Map<String, dynamic>>[];
      for (final round in upcomingData) {
        final gameId = round['game_id'] as String?;
        String gameName = 'Unknown';
        if (gameId != null) {
          final match = gamesData.cast<Map<String, dynamic>>().firstWhere(
            (g) => g['id'] == gameId,
            orElse: () => <String, dynamic>{},
          );
          gameName = match['name'] ?? 'Unknown';
        }
        upcomingWithNames.add(Map<String, dynamic>.from(round)..['gameName'] = gameName);
      }

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
        createdAt: DateTime.parse(g['created_at'] as String),
        updatedAt: DateTime.parse(g['updated_at'] as String),
      )).toList();

      if (mounted) {
        setState(() {
          _liveMarket = activeData;
          _upcomingMarkets = upcomingWithNames;
          _recentResults = resultsData;
          _allGames = games;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _loading = false);
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
    _loadGameDetail(gameId);
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
                  _buildBannerCarousel(homeController.banners),
                  const SizedBox(height: 16),
                  _buildActionButtons(),
                  const SizedBox(height: 16),
                  _buildLiveMarketSection(),
                  const SizedBox(height: 16),
                  _buildUpcomingSection(),
                  const SizedBox(height: 16),
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
          const Spacer(),
          Text(
            'WIN BAZAR',
            style: AppTextStyles.appName.copyWith(
              color: AppColors.gold,
              fontSize: 22,
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
        height: 160,
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
          height: 160,
          child: PageView.builder(
            itemCount: banners.length,
            onPageChanged: (index) {
              setState(() => _currentBanner = index);
            },
            itemBuilder: (context, index) {
              final banner = banners[index];
              return Container(
                margin: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(
                  gradient: AppColors.goldGradient,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Stack(
                  children: [
                    Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (banner.title.isNotEmpty)
                            Text(
                              banner.title,
                              style: AppTextStyles.bannerTitle,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          if (banner.description.isNotEmpty) ...[
                            const SizedBox(height: 6),
                            Text(
                              banner.description,
                              style: AppTextStyles.body.copyWith(color: Colors.white70, fontSize: 13),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                          const Spacer(),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: const Text(
                              '100%\nTRUSTED AND SECURE',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                height: 1.3,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    Positioned(
                      right: -20,
                      top: -20,
                      child: Container(
                        width: 100,
                        height: 100,
                        decoration: const BoxDecoration(
                          shape: BoxShape.circle,
                          color: Color(0x14FFFFFF),
                        ),
                      ),
                    ),
                  ],
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

  Widget _buildUpcomingSection() {
    if (_upcomingMarkets.isEmpty)
      return _buildEmptyMarketCard('No Upcoming Markets', 'WAITING', AppColors.warning);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Text('UPCOMING MARKET', style: AppTextStyles.sectionHeading),
        ),
        const SizedBox(height: 10),
        ...List.generate(_upcomingMarkets.length, (index) {
          final market = _upcomingMarkets[index];
          return _buildUpcomingMarketCard(
            name: (market['gameName'] ?? 'Unknown').toUpperCase(),
            status: 'WAITING',
            statusColor: AppColors.warning,
            openTime: _formatAmPm(market['start_time'] ?? market['startTime']),
            closeTime: _formatAmPm(market['end_time'] ?? market['endTime']),
          );
        }),
      ],
    );
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
    final name = (market['game_name'] ?? market['gameName'] ?? 'DESAWAR').toUpperCase();
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
                  onPressed: () {},
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

  Widget _buildUpcomingMarketCard({
    required String name,
    required String status,
    required Color statusColor,
    required String openTime,
    required String closeTime,
  }) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: AppTextStyles.marketTitle),
                const SizedBox(height: 3),
                Text('Open Time : $openTime', style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                Text('Close Time : $closeTime', style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
              ],
            ),
          ),
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
