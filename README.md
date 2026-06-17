1. Clone the repository

git clone https://github.com/oussamaelka05/municipality-admin-system.git
cd municipality-admin-system
----------------------------------------------------------------------------------------
2. Backend setup (Laravel)

cd backend
mkdir bootstrap\cache
composer install
copy .env.example .env
php artisan key:generate

Then open .env and set your database:
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=municipality_db
DB_USERNAME=root
DB_PASSWORD=

Then create the database in MySQL:
- Open phpMyAdmin → http://localhost/phpmyadmin
- Click "New" → name it municipality_db → click Create (so you can get the account to log in)

Then:
php artisan migrate --seed
php artisan serve
----------------------------------------------------------------------------------------
3. Frontend setup (React)

cd ../frontend
npm install
npm run dev
----------------------------------------------------------------------------------------
4. Access the app

Open http://localhost:5173 in your browser.
Email	admin@municipality.gov
Password	Admin@1234

**
If you can't log in, run:
php artisan tinker
Then paste:
\App\Models\User::create([
    'name' => 'Admin',
    'email' => 'admin@municipality.gov',
    'password' => bcrypt('Admin@1234'),
    'role' => 'admin',
    'is_active' => true,
]);
**
----------------------------------------------------------------------------------------
Requirements: PHP 8.2+, Composer, Node.js 18+, MySQL (XAMPP recommended on Windows)