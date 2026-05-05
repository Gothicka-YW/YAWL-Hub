with parsed_birthdays as (
  select
    id,
    nullif(btrim(birthday_raw), '') as normalized_birthday_raw
  from public.members
)
update public.members as members
set
  birthday_raw = parsed_birthdays.normalized_birthday_raw,
  birthday_month = case
    when parsed_birthdays.normalized_birthday_raw is null then null
    else extract(month from to_date(parsed_birthdays.normalized_birthday_raw || ' 2000', 'FMMonth FMDD YYYY'))::smallint
  end,
  birthday_day = case
    when parsed_birthdays.normalized_birthday_raw is null then null
    else extract(day from to_date(parsed_birthdays.normalized_birthday_raw || ' 2000', 'FMMonth FMDD YYYY'))::smallint
  end
from parsed_birthdays
where parsed_birthdays.id = members.id;