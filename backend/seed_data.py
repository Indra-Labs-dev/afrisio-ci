from database import SessionLocal, engine
from models import Base, Category, Quiz, Question, Option


def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if data already exists
    if db.query(Category).first():
        print("Database already seeded.")
        db.close()
        return

    # Create categories
    categories = [
        Category(name="Culture Générale", description="Questions de culture générale", icon="book-open"),
        Category(name="Mathématiques", description="Mathématiques de base et avancées", icon="calculator"),
        Category(name="Physique", description="Physique et sciences", icon="atom"),
        Category(name="Sciences Numériques", description="Informatique et technologie", icon="computer"),
        Category(name="Économie", description="Économie et gestion", icon="trending-up"),
        Category(name="Français", description="Langue et littérature française", icon="pen-tool"),
    ]
    db.add_all(categories)
    db.commit()

    # Sample Quiz 1: Culture Générale
    quiz1 = Quiz(
        title="Culture Générale - Niveau Bac",
        description="Testez vos connaissances en culture générale",
        category_id=1,
        duration_minutes=20,
        difficulty="medium"
    )
    db.add(quiz1)
    db.commit()

    questions1 = [
        Question(
            quiz_id=quiz1.id,
            question_text="Quelle est la capitale de la Côte d'Ivoire ?",
            points=1,
            order=1,
            options=[
                Option(option_text="Abidjan", is_correct=False, order=1),
                Option(option_text="Yamoussoukro", is_correct=True, order=2),
                Option(option_text="Bouaké", is_correct=False, order=3),
                Option(option_text="San Pedro", is_correct=False, order=4),
            ]
        ),
        Question(
            quiz_id=quiz1.id,
            question_text="Qui a écrit 'Les Soleils des Indépendances' ?",
            points=1,
            order=2,
            options=[
                Option(option_text="Ahmadou Kourouma", is_correct=True, order=1),
                Option(option_text="Chinua Achebe", is_correct=False, order=2),
                Option(option_text="Wole Soyinka", is_correct=False, order=3),
                Option(option_text="Ngũgĩ wa Thiong'o", is_correct=False, order=4),
            ]
        ),
        Question(
            quiz_id=quiz1.id,
            question_text="En quelle année la Côte d'Ivoire a-t-elle obtenu son indépendance ?",
            points=1,
            order=3,
            options=[
                Option(option_text="1958", is_correct=False, order=1),
                Option(option_text="1960", is_correct=True, order=2),
                Option(option_text="1962", is_correct=False, order=3),
                Option(option_text="1965", is_correct=False, order=4),
            ]
        ),
    ]
    db.add_all(questions1)

    # Sample Quiz 2: Mathématiques
    quiz2 = Quiz(
        title="Mathématiques - Algèbre de base",
        description="Résolvez des problèmes d'algèbre",
        category_id=2,
        duration_minutes=30,
        difficulty="easy"
    )
    db.add(quiz2)
    db.commit()

    questions2 = [
        Question(
            quiz_id=quiz2.id,
            question_text="Quelle est la solution de l'équation 2x + 4 = 10 ?",
            points=1,
            order=1,
            options=[
                Option(option_text="x = 2", is_correct=False, order=1),
                Option(option_text="x = 3", is_correct=True, order=2),
                Option(option_text="x = 4", is_correct=False, order=3),
                Option(option_text="x = 5", is_correct=False, order=4),
            ]
        ),
        Question(
            quiz_id=quiz2.id,
            question_text="Quel est le résultat de 5² + 3² ?",
            points=1,
            order=2,
            options=[
                Option(option_text="16", is_correct=False, order=1),
                Option(option_text="25", is_correct=False, order=2),
                Option(option_text="34", is_correct=True, order=3),
                Option(option_text="64", is_correct=False, order=4),
            ]
        ),
        Question(
            quiz_id=quiz2.id,
            question_text="Si a = 3 et b = 4, quel est le valeur de a² + b² ?",
            points=1,
            order=3,
            options=[
                Option(option_text="7", is_correct=False, order=1),
                Option(option_text="12", is_correct=False, order=2),
                Option(option_text="25", is_correct=True, order=3),
                Option(option_text="49", is_correct=False, order=4),
            ]
        ),
    ]
    db.add_all(questions2)

    # Sample Quiz 3: Sciences Numériques
    quiz3 = Quiz(
        title="Informatique - Bases de données",
        description="Introduction aux bases de données",
        category_id=4,
        duration_minutes=25,
        difficulty="medium"
    )
    db.add(quiz3)
    db.commit()

    questions3 = [
        Question(
            quiz_id=quiz3.id,
            question_text="Que signifie SQL ?",
            points=1,
            order=1,
            options=[
                Option(option_text="Simple Query Language", is_correct=False, order=1),
                Option(option_text="Structured Query Language", is_correct=True, order=2),
                Option(option_text="Standard Query Language", is_correct=False, order=3),
                Option(option_text="System Query Language", is_correct=False, order=4),
            ]
        ),
        Question(
            quiz_id=quiz3.id,
            question_text="Quel type de base de données utilise MongoDB ?",
            points=1,
            order=2,
            options=[
                Option(option_text="Relationnelle", is_correct=False, order=1),
                Option(option_text="NoSQL orientée documents", is_correct=True, order=2),
                Option(option_text="Graph", is_correct=False, order=3),
                Option(option_text="Clé-valeur", is_correct=False, order=4),
            ]
        ),
        Question(
            quiz_id=quiz3.id,
            question_text="Quelle commande SQL permet de sélectionner des données ?",
            points=1,
            order=3,
            options=[
                Option(option_text="GET", is_correct=False, order=1),
                Option(option_text="FETCH", is_correct=False, order=2),
                Option(option_text="SELECT", is_correct=True, order=3),
                Option(option_text="EXTRACT", is_correct=False, order=4),
            ]
        ),
    ]
    db.add_all(questions3)

    # Sample Quiz 4: Français
    quiz4 = Quiz(
        title="Français - Grammaire",
        description="Testez votre maîtrise de la grammaire française",
        category_id=6,
        duration_minutes=20,
        difficulty="medium"
    )
    db.add(quiz4)
    db.commit()

    questions4 = [
        Question(
            quiz_id=quiz4.id,
            question_text="Quelle est la nature du mot 'rapidement' ?",
            points=1,
            order=1,
            options=[
                Option(option_text="Adjectif", is_correct=False, order=1),
                Option(option_text="Adverbe", is_correct=True, order=2),
                Option(option_text="Nom", is_correct=False, order=3),
                Option(option_text="Verbe", is_correct=False, order=4),
            ]
        ),
        Question(
            quiz_id=quiz4.id,
            question_text="Quel est le pluriel de 'cheval' ?",
            points=1,
            order=2,
            options=[
                Option(option_text="chevals", is_correct=False, order=1),
                Option(option_text="chevaux", is_correct=True, order=2),
                Option(option_text="chevals", is_correct=False, order=3),
                Option(option_text="chevails", is_correct=False, order=4),
            ]
        ),
        Question(
            quiz_id=quiz4.id,
            question_text="Quelle est la fonction du groupe 'à Paris' dans 'Il habite à Paris' ?",
            points=1,
            order=3,
            options=[
                Option(option_text="Complément d'objet direct", is_correct=False, order=1),
                Option(option_text="Complément circonstanciel de lieu", is_correct=True, order=2),
                Option(option_text="Attribut du sujet", is_correct=False, order=3),
                Option(option_text="Complément d'objet indirect", is_correct=False, order=4),
            ]
        ),
    ]
    db.add_all(questions4)

    db.commit()
    print("Database seeded successfully!")
    db.close()


if __name__ == "__main__":
    seed_database()
