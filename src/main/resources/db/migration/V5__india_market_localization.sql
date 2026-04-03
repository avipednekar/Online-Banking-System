update accounts
set currency_code = 'INR'
where currency_code is null
   or upper(currency_code) <> 'INR';

update transfer_records
set currency_code = 'INR'
where currency_code is null
   or upper(currency_code) <> 'INR';

alter table accounts
alter column currency_code set default 'INR';

alter table transfer_records
alter column currency_code set default 'INR';

alter table accounts
add constraint chk_accounts_currency_code_inr
check (upper(currency_code) = 'INR');

alter table transfer_records
add constraint chk_transfer_records_currency_code_inr
check (upper(currency_code) = 'INR');
