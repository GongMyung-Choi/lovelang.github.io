create trigger notify_ai_and_send_mail
after insert on messages
for each row
execute function supabase_functions.http_request(
  'https://omchtafaqgkdwcrwscrp.supabase.co/functions/v1/notify',
  'POST',
  '{}',
  json_build_object('record', new)
);
