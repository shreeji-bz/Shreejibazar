import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:shri_ji_bazaar/core/theme/app_text_styles.dart';
import 'package:shri_ji_bazaar/core/routes/route_names.dart';
import '../controllers/profile_controller.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final controller = Provider.of<ProfileController>(context, listen: false);
    if (controller.status == ProfileStatus.initial && controller.profile == null) {
      controller.loadProfile();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        actions: [
          IconButton(
            onPressed: () => context.push(RouteNames.settings),
            icon: const Icon(Icons.settings_rounded),
            tooltip: 'Settings',
          ),
        ],
      ),
      body: SafeArea(
        child: Consumer<ProfileController>(
          builder: (context, profileController, _) {
            final name = profileController.displayName;
            final mobile = profileController.displayMobile;
            final email = profileController.displayEmail;
            final referralCode = profileController.displayReferralCode;
            final points = profileController.displayPoints;

            if (profileController.status == ProfileStatus.loading && profileController.profile == null) {
              return const Center(child: CircularProgressIndicator());
            }

            return SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  Container(
                    width: 96,
                    height: 96,
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        colors: [Color(0xFF8A5A00), Color(0xFFD89B18)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(Icons.person_rounded, size: 48, color: Colors.white),
                  ),
                  const SizedBox(height: 16),
                  Text(name, style: Theme.of(context).textTheme.headlineMedium),
                  const SizedBox(height: 4),
                  Text(mobile.isNotEmpty ? mobile : 'Player', style: Theme.of(context).textTheme.bodyMedium),
                  const SizedBox(height: 24),
                  Card(
                    child: Column(
                      children: [
                        _ProfileTile(icon: Icons.phone_rounded, label: 'Mobile', value: mobile.isNotEmpty ? mobile : '-'),
                        const Divider(height: 1),
                        _ProfileTile(icon: Icons.email_rounded, label: 'Email', value: email.isNotEmpty ? email : '-'),
                        const Divider(height: 1),
                        _ProfileTile(icon: Icons.card_membership_rounded, label: 'Referral Code', value: referralCode.isNotEmpty ? referralCode : '-'),
                        const Divider(height: 1),
                        _ProfileTile(icon: Icons.stars_rounded, label: 'Points', value: '$points'),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: () => context.push(RouteNames.settings),
                      icon: const Icon(Icons.edit_rounded),
                      label: const Text('Edit Profile'),
                    ),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: () async {
                        final confirmed = await showDialog<bool>(
                          context: context,
                          builder: (context) => AlertDialog(
                            title: const Text('Logout'),
                            content: const Text('Are you sure you want to logout?'),
                            actions: [
                              TextButton(onPressed: () => context.pop(false), child: const Text('Cancel')),
                              TextButton(onPressed: () => context.pop(true), child: const Text('Logout')),
                            ],
                          ),
                        );
                        if (confirmed == true && context.mounted) {
                          profileController.logout();
                          context.go(RouteNames.login);
                        }
                      },
                      icon: const Icon(Icons.logout_rounded),
                      label: const Text('Logout'),
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}

class _ProfileTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _ProfileTile({required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, size: 22, color: Theme.of(context).colorScheme.primary),
      title: Text(label, style: AppTextStyles.caption),
      subtitle: Text(value, style: AppTextStyles.body),
    );
  }
}
