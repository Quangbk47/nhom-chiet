import { getApps, initializeApp } from 'firebase/app';
import { doc, getFirestore, setDoc } from 'firebase/firestore';
import type { FirebaseRuntimeConfig } from './config';
import type { PersistableDocument } from './contracts';
import type { PersistenceDriver } from './adapter';

export function createFirestoreDriver(config: FirebaseRuntimeConfig): PersistenceDriver {
  const app = getApps()[0] ?? initializeApp(config);
  const firestore = getFirestore(app);
  return {
    save: async (path, document: PersistableDocument) => {
      await setDoc(doc(firestore, path), document);
    },
  };
}
