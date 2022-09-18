import { withAuthenticator } from '@aws-amplify/ui-react';
import "@aws-amplify/ui-react/styles.css";
import { API, Storage } from 'aws-amplify';
import React, { useEffect, useState } from 'react';
import './App.css';
import { createNote as createNoteMutation, deleteNote as deleteNoteMutation } from './graphql/mutations';
import { listNotes } from './graphql/queries';

const initialFormState = { name: '', description: '' }

function Rider({ signOut }) {

  return (
    <div className="">
      <div className='flex justify-center'>
            <button className=' text-white font-bold cursor-pointer rounded-full p-2 text-md text-center hover:bg-slate-900 border-2 border-slate-900 transition-all duration-200' onClick={signOut}>Sign Out</button>
        </div>
      <div className='text-center text-white'><p>Rider functionality coming soon</p></div>
    </div>
  );
}

export default withAuthenticator(Rider);