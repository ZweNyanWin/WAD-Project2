# 🍽️ PlateMate

A collaborative recipe-sharing web app built with **Next.js + Express + MongoDB**, enabling users to create, browse, and manage their own cooking recipes with a clean and responsive UI.

---

## 📖 Project Description
**PlateMate** is a full-stack recipe management platform where users can:
- ✍️ Create and edit new recipes with ingredients, steps, and photos  
- 🔍 Browse recipes by difficulty or ingredients  
- ⭐ Rate and review other users’ recipes  
- 🧑‍🍳 Maintain their own recipe collections with personal accounts  

The app combines:
- **Frontend:** Next.js (React)
- **Backend:** Express.js + Node.js
- **Database:** MongoDB with Mongoose
- **Styling:** Tailwind CSS

---

## 🖼️ Screenshots

### 🏠 Browse Recipes
<p align="center">
  <img src="https://github.com/zinmemethet/PlateMate/assets/XXXXXXXXXXXX/browse.png" width="800" />
  <br/>
  <em>Recipe browsing page showing different dishes and filters.</em>
</p>

### ➕ Create New Recipe
<p align="center">
  <img src="https://github.com/zinmemethet/PlateMate/assets/XXXXXXXXXXXX/create.png" width="800" />
  <br/>
  <em>Form to create a new recipe with dynamic ingredient and step fields.</em>
</p>

### 🔑 Login Page
<p align="center">
  <img src="https://github.com/zinmemethet/PlateMate/assets/XXXXXXXXXXXX/login.png" width="800" />
  <br/>
  <em>Login interface for existing users.</em>
</p>

### 🧾 Signup Page
<p align="center">
  <img src="https://github.com/zinmemethet/PlateMate/assets/XXXXXXXXXXXX/signup.png" width="800" />
  <br/>
  <em>Signup interface for new users to register an account.</em>
</p>

---

👥 Team Members

Zwe Nyan Win

Su Phyu Sin

Zin Me Me Thet

## ⚙️ How to Run Locally

```bash
# Clone the repo
git clone https://github.com/zinmemethet/PlateMate.git
cd PlateMate

# Install dependencies
npm install

# Configure environment variables
echo "MONGODB_URI=<your-mongodb-connection-string>" >> .env
echo "JWT_SECRET=<your-secret-key>" >> .env

# Run the app
npm run dev
