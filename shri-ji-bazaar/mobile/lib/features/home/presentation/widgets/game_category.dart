import 'package:flutter/material.dart';

class GameCategory extends StatelessWidget {
  const GameCategory({super.key, required this.title, required this.games});

  final String title;
  final List games;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        ),
        SizedBox(
          height: 160,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12),
            itemCount: games.length,
            itemBuilder: (context, index) => Container(
              width: 120,
              margin: const EdgeInsets.symmetric(horizontal: 4),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(8),
                color: Colors.grey[300],
              ),
            ),
          ),
        ),
      ],
    );
  }
}
