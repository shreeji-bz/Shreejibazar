class Formatters {
  static String formatPoints(int points) {
    return points.toString().replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]},',
    );
  }

  static String formatDate(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);

    if (diff.inDays == 0) return 'Today';
    if (diff.inDays == 1) return 'Yesterday';
    if (diff.inDays < 7) return '${diff.inDays} days ago';

    return '${date.day}/${date.month}/${date.year}';
  }

  static String formatTime(String time) {
    // Assumes time is in HH:MM format (24h)
    final parts = time.split(':');
    if (parts.length != 2) return time;
    final hour = int.parse(parts[0]);
    final minute = parts[1];
    final period = hour >= 12 ? 'PM' : 'AM';
    final hour12 = hour > 12 ? hour - 12 : (hour == 0 ? 12 : hour);
    return '$hour12:$minute $period';
  }
}
