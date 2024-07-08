from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from sqlalchemy.orm import sessionmaker, scoped_session
from sqlalchemy import create_engine

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///todos.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Enable CORS for all origins
CORS(app)

engine = create_engine('sqlite:///sqlite:///todos.db', connect_args={'check_same_thread': False})
Session = sessionmaker(bind=db.engine)
session = scoped_session(Session)

class Todo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200))
    completed = db.Column(db.Boolean, default = False)

@app.route('/todos', methods=['GET'])
def get_todos():
    todos = session.query(Todo).all()
    return jsonify([{'id': todo.id, 'title': todo.title, 'completed': todo.completed} for todo in todos])

@app.route('/todos', methods=['POST'])
def add_todo():
    data = request.get_json()
    new_todo = Todo(title=data['title'], completed=False)
    session.add(new_todo)
    session.commit()
    return jsonify({'id': new_todo.id, 'title': new_todo.title, 'completed': new_todo.completed})

@app.route('/todos/<int:id>', methods=['PUT'])
def update_todo(id):
    try:
        data = request.get_json()
        todo = Todo.query.get(id)
        if not todo:
            return jsonify({'error': 'Todo not found'}), 404
        todo.title = data.get('title', todo.title)
        todo.completed = data.get('completed', todo.completed)
        db.session.commit()
        return jsonify({'id': todo.id, 'title': todo.title, 'completed': todo.completed})
    except Exception as e:
        print(f"Error: {e}")
        db.session.rollback()
        return jsonify({'error': 'An error occurred'}), 500
    finally:
        db.session.close()

@app.route('/todos/<int:id>', methods=['DELETE'])
def delete_todo(id):
    todo = session.query(Todo).filter_by(id=id).first()
    if not todo:
        return jsonify({'error': 'Todo not found'}), 404
    session.delete(todo)
    session.commit()
    return '', 204

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=9000)
