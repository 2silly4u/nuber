import { Heading, Link, withAuthenticator } from '@aws-amplify/ui-react';
import "@aws-amplify/ui-react/styles.css";
import { API, Storage } from 'aws-amplify';
import React, { useEffect, useState } from 'react';
import './App.css';
import Driver from './Driver';
import Rider from './Rider';
import { createNote as createNoteMutation, deleteNote as deleteNoteMutation } from './graphql/mutations';
import { listNotes } from './graphql/queries';

const initialFormState = { name: '', description: '' }

function App({ signOut }) {
  const [notes, setNotes] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [isDriver, setIsDriver] = useState(false)
  const [isRider, setIsRider] = useState(false)

  async function onChange(e) {
    if (!e.target.files[0]) return
    const file = e.target.files[0];
    setFormData({ ...formData, image: file.name });
    await Storage.put(file.name, file);
    fetchNotes();
  }

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    const apiData = await API.graphql({ query: listNotes });
    const notesFromAPI = apiData.data.listNotes.items;
    await Promise.all(notesFromAPI.map(async note => {
      if (note.image) {
        const image = await Storage.get(note.image);
        note.image = image;
      }
      return note;
    }))
    setNotes(apiData.data.listNotes.items);
  }

  async function createNote() {
    if (!formData.name || !formData.description) return;
    await API.graphql({ query: createNoteMutation, variables: { input: formData } });
    if (formData.image) {
      const image = await Storage.get(formData.image);
      formData.image = image;
    }
    setNotes([ ...notes, formData ]);
    setFormData(initialFormState);
  }

  async function deleteNote({ id }) {
    const newNotesArray = notes.filter(note => note.id !== id);
    setNotes(newNotesArray);
    await API.graphql({ query: deleteNoteMutation, variables: { input: { id } }});
  }
  const handleDriver = e =>{
    setIsDriver(current => !current);
  }
  const handleRider = e =>{
    setIsRider(current => !current)
  }
  return (
    <div className="bg-slate-800 min-h-screen">
      <p className='p-4 text-center text-2xl text-white'>Nuber</p>
      {!isDriver && <div className='flex m-2 space-x-4 justify-center'>
        <button className='text-white font-bold cursor-pointer rounded-full p-4 text-lg text-center hover:bg-slate-900 border-2 border-slate-900 transition-all duration-200' onClick={handleDriver}>Sign up as a Driver</button>
        <button className='text-white font-bold cursor-pointer rounded-full p-4 text-lg text-center hover:bg-slate-900 border-2 border-slate-900 transition-all duration-200' onClick={handleRider}>Sign up as a Rider</button>
      </div>}l
        
      {isDriver && <Driver/>}
      {isRider && <Rider/>}
    </div>
  );
}

export default App;