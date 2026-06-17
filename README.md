# Municipality Admin System

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/oussamaelka05/municipality-admin-system.git
cd municipality-admin-system
```

---

### 2. Backend setup (Laravel)

```bash
cd backend
mkdir bootstrap\cache
composer install
copy .env.example .env
php artisan key:generate
```

Then open `.env` and set your database:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=municipality_db
DB_USERNAME=root
DB_PASSWORD=

'
SESSION_DRIVER=file
'
```

Then create the database in MySQL:
- Open phpMyAdmin → http://localhost/phpmyadmin
- Click **New** → name it `municipality_db` → click **Create**

Then run:

```bash
php artisan migrate --seed
php artisan serve
```

---

### 3. Frontend setup (React)

```bash
cd ../frontend
npm install
npm run dev
```

---

### 4. Access the app

Open **http://localhost:5173** in your browser.

| Field    | Value                     |
|----------|---------------------------|
| Email    | admin@municipality.gov    |
| Password | Admin@1234                |

> **Can't log in?** Run `php artisan tinker` then paste:
> ```php
> \App\Models\User::create([
>     'name' => 'Admin',
>     'email' => 'admin@municipality.gov',
>     'password' => bcrypt('Admin@1234'),
>     'role' => 'admin',
>     'is_active' => true,
> ]);
> ```

---

**Requirements:** PHP 8.2+, Composer, Node.js 18+, MySQL (XAMPP recommended on Windows)
