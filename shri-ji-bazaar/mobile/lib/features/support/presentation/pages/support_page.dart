import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shri_ji_bazaar/core/theme/app_text_styles.dart';
import '../controllers/support_controller.dart';

class SupportPage extends StatelessWidget {
  const SupportPage({super.key});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Support'),
          bottom: const TabBar(
            tabs: [
              Tab(text: 'New Ticket'),
              Tab(text: 'My Tickets'),
            ],
          ),
        ),
        body: SafeArea(
          child: TabBarView(
            children: [
              _NewTicketForm(),
              _TicketList(),
            ],
          ),
        ),
      ),
    );
  }
}

class _NewTicketForm extends StatefulWidget {
  const _NewTicketForm();

  @override
  State<_NewTicketForm> createState() => _NewTicketFormState();
}

class _NewTicketFormState extends State<_NewTicketForm> {
  final _formKey = GlobalKey<FormState>();
  final _subjectController = TextEditingController();
  final _messageController = TextEditingController();
  String _category = 'General';

  @override
  void dispose() {
    _subjectController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const SizedBox(height: 16),
            Text('Category', style: AppTextStyles.sectionHeading),
            const SizedBox(height: 10),
            ...['General', 'Payment Issue', 'Game Issue', 'Account Issue', 'Other'].map((cat) {
              final isSelected = _category == cat;
              return GestureDetector(
                onTap: () => setState(() => _category = cat),
                child: Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.surface,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: isSelected ? Theme.of(context).colorScheme.primary : Theme.of(context).colorScheme.primary.withValues(alpha: 0.1),
                      width: isSelected ? 2 : 1,
                    ),
                  ),
                  child: Text(cat, style: AppTextStyles.body),
                ),
              );
            }),
            const SizedBox(height: 20),
            TextFormField(
              controller: _subjectController,
              decoration: const InputDecoration(
                labelText: 'Subject',
                hintText: 'Brief description of your issue',
                prefixIcon: Icon(Icons.subject_rounded),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) return 'Please enter a subject';
                return null;
              },
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _messageController,
              maxLines: 5,
              decoration: const InputDecoration(
                labelText: 'Message',
                hintText: 'Describe your issue in detail',
                prefixIcon: Icon(Icons.message_rounded),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) return 'Please enter your message';
                return null;
              },
            ),
            const SizedBox(height: 24),
            Consumer<SupportController>(
              builder: (context, supportController, _) {
                return SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: () {
                      if (_formKey.currentState!.validate()) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Support ticket submitted!'), backgroundColor: Color(0xFF25C85A)),
                        );
                        _subjectController.clear();
                        _messageController.clear();
                      }
                    },
                    child: const Text('Submit Ticket', style: TextStyle(fontSize: 16)),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _TicketList extends StatelessWidget {
  static const _tickets = [
    {'subject': 'Deposit not credited', 'status': 'Open', 'date': '2 hours ago'},
    {'subject': 'Game not loading', 'status': 'Resolved', 'date': '3 days ago'},
    {'subject': 'Withdrawal delay', 'status': 'In Progress', 'date': '1 week ago'},
  ];

  @override
  Widget build(BuildContext context) {
    return Consumer<SupportController>(
      builder: (context, supportController, _) {
        final tickets = _tickets;

        if (tickets.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.support_agent_rounded, size: 64, color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.3)),
                const SizedBox(height: 16),
                Text('No tickets yet', style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 8),
                Text('Submit a ticket and we\'ll help you.', style: Theme.of(context).textTheme.bodySmall),
              ],
            ),
          );
        }

        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: tickets.length,
          itemBuilder: (context, index) {
            final ticket = tickets[index];
            final status = ticket['status'] as String;
            Color statusColor;
            switch (status) {
              case 'Open':
                statusColor = const Color(0xFF42A5F5);
                break;
              case 'In Progress':
                statusColor = const Color(0xFFFFA726);
                break;
              case 'Resolved':
                statusColor = const Color(0xFF25C85A);
                break;
              default:
                statusColor = const Color(0xFF7A6E5A);
            }
            return Card(
              margin: const EdgeInsets.only(bottom: 10),
              child: ListTile(
                contentPadding: const EdgeInsets.all(14),
                title: Text(ticket['subject'] as String, style: AppTextStyles.cardTitle),
                subtitle: Text(ticket['date'] as String, style: AppTextStyles.bodySmall),
                trailing: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: statusColor.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(status, style: AppTextStyles.caption.copyWith(color: statusColor)),
                ),
              ),
            );
          },
        );
      },
    );
  }
}
