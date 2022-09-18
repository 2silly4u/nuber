import { withAuthenticator } from '@aws-amplify/ui-react';
import "@aws-amplify/ui-react/styles.css";
import { API, Storage } from 'aws-amplify';
import React, { useEffect, useState } from 'react';
import './App.css';
import { createNote as createNoteMutation, deleteNote as deleteNoteMutation } from './graphql/mutations';
import { listNotes } from './graphql/queries';

const initialFormState = { name: '', description: '' }

function Driver({ signOut }) {
  const [notes, setNotes] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [uploaded, setUploaded] = useState(false)


    if(!uploaded) {
        if(notes.length > 0){
            setUploaded(true);
        }
    }

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
    if (!formData.image) return;
    await API.graphql({ query: createNoteMutation, variables: { input: formData } });
    if (formData.image) {
      const image = await Storage.get(formData.image);
      formData.image = image;
    }
    setNotes([ ...notes, formData ]);
    setFormData(initialFormState);
    setUploaded(true)
  }

  async function deleteNote({ id }) {
    const newNotesArray = notes.filter(note => note.id !== id);
    setNotes(newNotesArray);
    setUploaded(false)
    await API.graphql({ query: deleteNoteMutation, variables: { input: { id } }});
  }
  return (
    <div className="">
        <div className='flex justify-center'>
            <button className=' text-white font-bold cursor-pointer rounded-full p-2 text-md text-center hover:bg-slate-900 border-2 border-slate-900 transition-all duration-200' onClick={signOut}>Sign Out</button>
        </div>
        
        {!uploaded && <div className='flex justify-center'>
            <input className='bg-slate-600 rounded-xl p-1' type="file" onChange={onChange}/>
            <button className='m-4 p-2 bg-slate-600 hover:bg-slate-700 rounded-xl text-white' onClick={createNote}>Upload Identification</button>
        </div>
        }
        
        <div className='mt-10 flex justify-center'>
        {notes.map(note => (
            <div key={note.id || note.name}>
                <button className='p-2 bg-slate-600 hover:bg-slate-700 text-white' onClick={() => deleteNote(note)}>Delete Identification</button>
                {
                note.image && <img src={note.image} style={{width: 400}} />
                }
            </div>
            )) 
        }
        </div>
        {uploaded && <div className='text-center text-white'><p>Your identification has been uploaded</p></div> }
    </div>
  );
}

export default withAuthenticator(Driver);