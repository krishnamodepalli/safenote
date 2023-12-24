import hashlib
import time

# from slugify import slugify
from sqlalchemy import create_engine, Column, String, Text, Integer, select
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm.session import sessionmaker
from flask import Flask, render_template, request, redirect, jsonify

app = Flask(__name__)
# creating the engine
engine = create_engine('sqlite:///sample.db', echo=True)

# Base class
Base = declarative_base()
class Note(Base):
    __tablename__ = 'note'
    name = Column(String(30), primary_key=True)
    passwd = Column(String(70))
    data = Column(Text)

    def __init__(self, name, passwd):
        self.name = name
        self.passwd = passwd
        self.data = ""

# creating the table
Base.metadata.create_all(bind=engine)

# binding the engine with the session
Session = sessionmaker(bind=engine)
session = Session()     # building the object with the `Session` class


@app.route('/')
def index():
    return render_template('layout.html')


@app.route('/<note>')
def get_note(note: str):
    # get note_data from disk
    # data = select(Note).where(Note.name == note)
    result = session.query(Note).filter(Note.name == note).all()
    # check if result is empty
    if len(result) == 0:
        # No suck page exists, do you want to  create it?
        return render_template('layout.html', note_name=note, note_data="", req='create')
    else:
        # some result found
        return render_template('layout.html', note_name=note, note_data=result[0].data, req='passwd')


def hash_it(ip_passwd: str) -> str:
    return hashlib.sha256(ip_passwd.encode()).hexdigest()


@app.route('/create-note', methods=['POST'])
def create_note():
    note_name = request.json.get('name')[1:]
    note_passwd = request.json.get('passwd')
    # saving into the database
    passwd = hash_it(note_passwd)
    # creating the note
    note = Note(note_name, passwd)
    session.add(note)
    session.commit()        # committing the changes to the database

    return jsonify({'msg': 'Success'}), 201


@app.route('/<note>/check', methods=['POST'])
def check_passwd(note):
    name = note
    passwd = request.json.get('passwd')
    note = session.query(Note).where(Note.name == name).first()

    crypt_passwd = hash_it(passwd)
    if note.passwd == crypt_passwd:
        return jsonify({'msg': 'Password is correct'}), 200
    return jsonify({'msg': 'Password is wrong'}), 401


@app.route('/<note>/save-note', methods=['POST'])
def save_note(note):
    note_data = request.data
    note = session.query(Note).where(Note.name == note).first()
    note.data = note_data.decode()
    session.commit()
    data = {
        'success': True,
        'msg': "saved note"
    }
    return jsonify(data), 200


@app.route('/about')
def about():
    pass


@app.route('/contact')
def contact():
    pass

if __name__ == '__main__':
    app.run()
