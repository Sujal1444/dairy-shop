# 🥛 Dairy Shop Management System (MERN)

A full-stack **Dairy Shop Management System** built using the **MERN Stack (MongoDB, Express.js, React.js, Node.js)**.
This project helps manage dairy products, inventory, and operations with a clean UI and scalable backend.

---

## 🚀 Features

* 🧾 CRUD operations for dairy products
* 📦 Inventory management
* 🔗 RESTful API integration
* ⚡ Fast and responsive frontend
* 🌐 Full-stack architecture (frontend + backend separated)

---

## 🛠️ Tech Stack

### Frontend

* React.js
* HTML
* CSS
* Vite

### Backend

* Node.js
* Express.js

### Database

* MongoDB (Mongoose)

---

## 📂 Project Structure

```bash
dairy-shop/
│── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   ├── drop_db.js
│   ├── .env
│   ├── render.yaml
│   └── package.json
│
│── frontend/
│   ├── src/
│   ├── public/
│   ├── dist/
│   ├── index.html
│   ├── vercel.json
│   └── package.json
│
│── package.json
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/Sujal1444/dairy-shop.git
cd dairy-shop
```

---

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in `/backend`:

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

Run backend:

```bash
npm run dev
```

---

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 Deployment

* 🚀 Frontend deployed using **Vercel** (`vercel.json`)
* ⚙️ Backend deployed using **Render** (`render.yaml`)

---

## 🔌 API Example

| Method | Endpoint          | Description      |
| ------ | ----------------- | ---------------- |
| GET    | /api/products     | Get all products |
| POST   | /api/products     | Add product      |
| PUT    | /api/products/:id | Update product   |
| DELETE | /api/products/:id | Delete product   |

---

## ⚡ Future Improvements

* 📊 Analytics dashboard
* 🔐 Authentication system
* 🧾 Billing feature
* 📱 Mobile optimization

---

## 🤝 Contributing

Contributions are welcome!
Fork the repo and create a pull request 🚀

---

## 👨‍💻 Author

**Sujal Patel**
🔗 https://github.com/Sujal1444

---

⭐ Star this repo if you found it useful!
