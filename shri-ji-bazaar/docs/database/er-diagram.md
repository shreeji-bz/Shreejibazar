# Entity Relationship Diagram

See `/database/schemas/erd-diagram.png` for the visual ERD.

## Key Relationships
- users -> referrals (referral_code)
- games -> rounds (1:N)
- rounds -> results (1:1)
- users -> activities (1:N)
- users -> point_transactions (1:N)
