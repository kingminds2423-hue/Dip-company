# Security Specification for DIP BHOLA NETWORK

## Roles and Access Architecture
- **Admin**: Has full administrative privileges across company profile, staff management, partner equities, transaction approvals, and settings.
- **Staff / Technicians**: Can view their assigned profile, review daily activities, and record daily work/line maintenance expenses or customer bill collections.
- **Data Collections**:
  - `companies`: Read allowed for active application sessions. Write restricted to admin.
  - `partners`: Read allowed for application sessions. Write restricted to admin.
  - `staffs`: Read allowed. Write restricted to admin or staff updating their contact info.
  - `transactions`: Read allowed. Create allowed with valid fields (valid type 'income'|'expense', positive amount, date format, non-empty title). Update/Delete restricted to admin.
  - `customerDues`: Read and write allowed with positive amounts.
  - `settings`: Read allowed. Write restricted to admin.

## Validation Invariants
- `transactions`: Must have `type` in `['income', 'expense']`, `amount is number && amount >= 0`, `title is string && title.size() > 0`, `date is string`.
- `staffs`: Must have `name is string && name.size() > 0`, `salary is number && salary >= 0`.
- `partners`: Must have `name is string`, `investment is number && investment >= 0`.
