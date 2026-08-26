import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../theme/app_colors.dart';

class ShimmerLoader extends StatelessWidget {
  final double width;
  final double height;
  final double radius;

  const ShimmerLoader({
    super.key,
    this.width = double.infinity,
    this.height = 20,
    this.radius = 8,
  });

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: AppColors.shimmer,
      highlightColor: AppColors.cardSecondary,
      child: Container(width: width, height: height, decoration: BoxDecoration(color: AppColors.shimmer, borderRadius: BorderRadius.circular(radius))),
    );
  }
}
