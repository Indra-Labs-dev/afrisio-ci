import sys
import os

# Ajoute le chemin courant pour importer facilement
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models import User
from auth import hash_password

def make_admin(email: str):
    db = SessionLocal()
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        # Création d'un nouvel administrateur
        user = User(
            email=email, 
            username=email.split("@")[0], 
            hashed_password=hash_password("admin123"), 
            is_superuser=True, 
            is_active=True, 
            full_name="Administrateur"
        )
        db.add(user)
        print(f"✅ Nouvel administrateur créé : {email} (Le mot de passe par défaut est 'admin123').")
    else:
        # Promotion d'un utilisateur existant
        user.is_superuser = True
        print(f"✅ L'utilisateur existant {email} a été promu administrateur avec succès !")
        
    db.commit()
    db.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("💡 Usage : python make_admin.py <email_de_l_utilisateur>")
        sys.exit(1)
        
    target_email = sys.argv[1]
    make_admin(target_email)
