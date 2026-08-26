class Validators {
  static bool isValidMobile(String mobile) {
    return RegExp(r'^[6-9]\d{9}$').hasMatch(mobile);
  }

  static bool isValidEmail(String email) {
    return RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(email);
  }

  static bool isValidPassword(String password) {
    return password.length >= 8;
  }

  static String? validateMobile(String? value) {
    if (value == null || value.isEmpty) return 'Mobile number is required';
    if (!isValidMobile(value)) return 'Enter a valid mobile number';
    return null;
  }

  static String? validateEmail(String? value) {
    if (value == null || value.isEmpty) return 'Email is required';
    if (!isValidEmail(value)) return 'Enter a valid email';
    return null;
  }

  static String? validatePassword(String? value) {
    if (value == null || value.isEmpty) return 'Password is required';
    if (!isValidPassword(value)) return 'Password must be at least 8 characters';
    return null;
  }

  static String? validateConfirmPassword(String? password, String? confirmPassword) {
    if (confirmPassword == null || confirmPassword.isEmpty) return 'Please confirm your password';
    if (password != confirmPassword) return 'Passwords do not match';
    return null;
  }
}
