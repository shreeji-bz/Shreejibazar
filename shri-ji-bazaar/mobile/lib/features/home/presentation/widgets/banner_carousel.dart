import 'package:flutter/material.dart';

class BannerCarousel extends StatelessWidget {
  const BannerCarousel({super.key, required this.banners});

  final List banners;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 180,
      child: PageView.builder(
        itemCount: banners.length,
        itemBuilder: (context, index) => Container(
          margin: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            color: Colors.grey[300],
          ),
        ),
      ),
    );
  }
}
