import 'package:flutter/foundation.dart';
import '../../domain/usecases/get_tickets.dart';

class SupportController extends ChangeNotifier {
  final GetTickets getTickets;
  SupportController(this.getTickets);
}
