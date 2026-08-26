import 'package:flutter/material.dart';

class ResultItem extends StatelessWidget {
  final String gameName;
  final String roundNumber;
  final String result;
  final String declaredAt;

  const ResultItem({
    super.key,
    required this.gameName,
    required this.roundNumber,
    required this.result,
    required this.declaredAt,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        title: Text(gameName),
        subtitle: Text('Round $roundNumber - $declaredAt'),
        trailing: Text(
          result,
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
        ),
      ),
    );
  }
}
