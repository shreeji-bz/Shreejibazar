import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/constants/app_strings.dart';
import '../../../core/routes/route_names.dart';
import '../../../shared/widgets/custom_button.dart';
import '../../../shared/widgets/custom_text_field.dart';
import '../controllers/profile_controller.dart';

class EditProfilePage extends StatelessWidget {
  const EditProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => ProfileController(
        GetProfileUseCase(ProfileRepository(ProfileDatasource())),
        UpdateProfileUseCase(ProfileRepository(ProfileDatasource())),
        Provider.of<AuthController>(context, listen: false),
      )..loadProfile(),
      child: const _EditProfileContent(),
    );
  }
}

class _EditProfileContent extends StatefulWidget {
  const _EditProfileContent();

  @override
  State<_EditProfileContent> createState() => _EditProfileContentState();
}

class _EditProfileContentState extends State<_EditProfileContent> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final controller = Provider.of<ProfileController>(context, listen: false);
    if (_nameController.text.isEmpty && controller.profile != null) {
      _nameController.text = controller.displayName;
      _emailController.text = controller.displayEmail;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        title: const Text('Edit Profile', style: TextStyle(color: AppColors.goldBright)),
        leading: IconButton(onPressed: () => context.pop(), icon: const Icon(Icons.arrow_back, color: AppColors.textPrimary)),
      ),
      body: Consumer<ProfileController>(
        builder: (context, controller, _) {
          if (controller.status == ProfileStatus.loading && controller.profile == null) {
            return const Center(child: CircularProgressIndicator(color: AppColors.gold));
          }

          return SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  const SizedBox(height: 20),
                  // Avatar
                  Center(
                    child: Stack(
                      children: [
                        Container(
                          width: 100,
                          height: 100,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            gradient: AppColors.goldGradient,
                            boxShadow: [BoxShadow(color: AppColors.gold.withOpacity(0.3), blurRadius: 20, spreadRadius: 2)],
                            image: controller.profile?.avatar != null && controller.profile!.avatar!.isNotEmpty
                                ? DecorationImage(image: NetworkImage(controller.profile!.avatar!), fit: BoxFit.cover)
                                : null,
                            child: controller.profile?.avatar == null || controller.profile!.avatar!.isEmpty
                                ? const Icon(Icons.person, size: 50, color: AppColors.textPrimary)
                                : null,
                          ),
                        ),
                        Positioned(
                          bottom: 0,
                          right: 0,
                          child: Container(
                            width: 32,
                            height: 32,
                            decoration: const BoxDecoration(shape: BoxShape.circle, color: AppColors.gold),
                            child: const Icon(Icons.camera_alt, size: 16, color: AppColors.textPrimary),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),
                  CustomTextField(
                    controller: _nameController,
                    hintText: 'Full Name',
                    textInputAction: TextInputAction.next,
                    onChanged: (_) => controller.clearError(),
                  ),
                  const SizedBox(height: 16),
                  CustomTextField(
                    controller: _emailController,
                    hintText: 'Email',
                    keyboardType: TextInputType.emailAddress,
                    onChanged: (_) => controller.clearError(),
                  ),
                  const SizedBox(height: 24),
                  if (controller.errorMessage != null)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 16),
                      child: Text(controller.errorMessage!, style: const TextStyle(color: AppColors.error, fontSize: 13)),
                    ),
                  CustomButton(
                    label: 'Save Changes',
                    isLoading: controller.status == ProfileStatus.loading,
                    onPressed: () async {
                      final name = _nameController.text.trim();
                      final email = _emailController.text.trim();
                      if (name.isEmpty) return;
                      await controller.updateProfileInfo(name: name, email: email.isEmpty ? null : email);
                      if (controller.status == ProfileStatus.success && mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Profile updated successfully')));
                        context.pop();
                      }
                    },
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    super.dispose();
  }
}
