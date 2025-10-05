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
  <img src="https://github.com/user-attachments/assets/c915943c-1a37-45cc-8ea3-1aa83020fadd"width="800" />
  <br/>
  <em>Recipe browsing page showing different dishes and filters.</em>
</p>

### ➕ Create New Recipe
<p align="center">
  <img src="https://github.com/user-attachments/assets/3b6ff8c5-18b3-469a-a26e-3345bcf6cea0" width="800" />
  <br/>
  <em>Form to create a new recipe with dynamic ingredient and step fields.</em>
</p>

<p align="center"> 
  <img src="https://github.com/user-attachments/assets/placeholder-review-screenshot.png" width="800" /> 
  <br/> 
  <em>Rate recipes (1–5 stars), leave comments, and browse community feedback.</em> 
</p>


### 🔑 Login Page
<p align="center">
  <img src="https://github.com/user-attachments/assets/8b742623-4c48-4ef0-9571-e1c38a405f5a" width="800" />
  <br/>
  <em>Login interface for existing users.</em>
</p>

### 🧾 Signup Page
<p align="center">
  <img src="https://github.com/user-attachments/assets/fda68658-9fd6-4a33-b1fe-8e9718d12d40" width="800" />
  <br/>
  <em>Signup interface for new users to register an account.</em>
</p>

---

👥 Team Members

Zwe Nyan Win https://github.com/ZweNyanWin/ZweNyanWin.github.io

Su Phyu Sin https://github.com/suphyusin

Zin Me Me Thet https://github.com/ymmiz

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
