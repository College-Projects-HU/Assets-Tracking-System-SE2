SELECT 'CREATE DATABASE assets_auth_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'assets_auth_db')\gexec
SELECT 'CREATE DATABASE assets_asset_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'assets_asset_db')\gexec
SELECT 'CREATE DATABASE assets_user_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'assets_user_db')\gexec
SELECT 'CREATE DATABASE assets_report_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'assets_report_db')\gexec
SELECT 'CREATE DATABASE assets_maintenance_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'assets_maintenance_db')\gexec
SELECT 'CREATE DATABASE assets_notification_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'assets_notification_db')\gexec