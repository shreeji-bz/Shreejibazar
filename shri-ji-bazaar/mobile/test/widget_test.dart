import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('smoke: a minimal scaffold builds', (tester) async {
    await tester.pumpWidget(const MaterialApp(
      home: Scaffold(body: Center(child: Text('Shree Ji Bazaar'))),
    ));
    expect(find.text('Shree Ji Bazaar'), findsOneWidget);
  });
}
