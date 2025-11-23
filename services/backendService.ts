
import { Document, LibraryResource, StudentGrade, TimetableEntry, FinancialStatus, CalendarEvent } from '../types';

const DB_NAME = 'OticLearnDB';
const DB_VERSION = 1;

// --- IndexedDB Helpers ---

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      // Documents Store
      if (!db.objectStoreNames.contains('documents')) {
        db.createObjectStore('documents', { keyPath: 'id' });
      }
      // Events Store
      if (!db.objectStoreNames.contains('events')) {
        db.createObjectStore('events', { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => resolve((event.target as IDBOpenDBRequest).result);
    request.onerror = (event) => reject((event.target as IDBOpenDBRequest).error);
  });
};

const getStore = async (storeName: string, mode: IDBTransactionMode = 'readonly') => {
  const db = await openDB();
  const tx = db.transaction(storeName, mode);
  return tx.objectStore(storeName);
};

// --- Document Services ---

export const uploadFileToStorage = async (file: File): Promise<string> => {
  // In IndexedDB, we don't "upload" to a URL. We store the File object directly.
  // We return a temporary Blob URL here for immediate UI preview, but the
  // createDocumentRecord function handles the actual persistence of the Blob.
  return URL.createObjectURL(file);
};

export const extractTextContent = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (file.type === "application/pdf" || file.name.endsWith('.pdf')) {
         resolve("PDF Content. Use AI Chat to interact with this document.");
    } else if (file.name.endsWith('.docx')) {
         resolve("DOCX Content. Analysis available.");
    } else {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string || "");
        reader.onerror = () => reject(new Error("Failed to read text content."));
        reader.readAsText(file);
    }
  });
};

export const createDocumentRecord = async (
  title: string, 
  file: File, 
  fileUrl: string, // Only used for immediate display, we persist 'file' blob
  textContent: string
): Promise<Document> => {
  const store = await getStore('documents', 'readwrite');
  
  const newDoc: any = {
    id: Date.now().toString(),
    title: title,
    type: file.name.endsWith('.pdf') ? 'PDF' : file.name.endsWith('.docx') ? 'DOCX' : 'TXT',
    uploadDate: new Date().toISOString(),
    category: 'Personal Upload',
    content: textContent,
    contextReady: false,
    fileBlob: file, // Store the actual file blob in IDB
  };

  return new Promise((resolve, reject) => {
    const request = store.add(newDoc);
    request.onsuccess = () => {
      // Return the document object with a usable URL for the UI
      resolve({
          ...newDoc,
          fileUrl: URL.createObjectURL(file),
          fileBlob: undefined // Don't leak blob into UI state unnecessarily
      } as Document);
    };
    request.onerror = () => reject(request.error);
  });
};

export const fetchDocuments = async (): Promise<Document[]> => {
  const store = await getStore('documents');
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => {
      const results = request.result;
      // Convert stored Blobs back to URL strings for the frontend
      const docs = results.map((doc: any) => ({
          ...doc,
          fileUrl: doc.fileBlob ? URL.createObjectURL(doc.fileBlob) : undefined,
          fileBlob: undefined // Clean up for UI state
      }));
      // Sort desc
      docs.sort((a: Document, b: Document) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
      resolve(docs);
    };
    request.onerror = () => reject(request.error);
  });
};

export const updateDocumentStatus = async (id: string, updates: Partial<Document>): Promise<void> => {
  const db = await openDB();
  const tx = db.transaction('documents', 'readwrite');
  const store = tx.objectStore('documents');
  
  return new Promise((resolve, reject) => {
      const getReq = store.get(id);
      getReq.onsuccess = () => {
          const doc = getReq.result;
          if (!doc) {
              resolve();
              return;
          }
          const updatedDoc = { ...doc, ...updates };
          store.put(updatedDoc);
          resolve();
      };
      getReq.onerror = () => reject(getReq.error);
  });
};

export const deleteDocumentRecord = async (id: string): Promise<void> => {
  const store = await getStore('documents', 'readwrite');
  return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
  });
};

// --- Calendar Services (IndexedDB) ---

export const fetchEvents = async (): Promise<CalendarEvent[]> => {
  const store = await getStore('events');
  return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
          const events = request.result.map((ev: any) => ({
              ...ev,
              date: new Date(ev.date) // Convert string back to Date
          }));
          resolve(events.sort((a: any, b: any) => a.date.getTime() - b.date.getTime()));
      };
      request.onerror = () => reject(request.error);
  });
};

export const createEvent = async (event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> => {
  const store = await getStore('events', 'readwrite');
  const newEvent = {
      id: Date.now().toString(),
      ...event,
      date: event.date.toISOString() // Store as string in IDB
  };
  
  return new Promise((resolve, reject) => {
      const request = store.add(newEvent);
      request.onsuccess = () => resolve({ ...event, id: newEvent.id } as CalendarEvent);
      request.onerror = () => reject(request.error);
  });
};

// --- Mocks for External Data (Portal, Library) ---

export const fetchLibraryResources = async (query: string): Promise<LibraryResource[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const allResources: LibraryResource[] = [
                { id: '1', title: 'Advanced Artificial Intelligence', author: 'S. Russell', type: 'Book', source: 'OpenLibrary', url: '#', year: 2020 },
                { id: '2', title: 'Research Methods in Uganda', author: 'Dr. J. Okello', type: 'Journal', source: 'RENU', url: '#', year: 2023 },
                { id: '3', title: 'Computer Vision Algorithms', author: 'IEEE', type: 'Paper', source: 'IEEE Xplore', url: '#', year: 2022 },
                { id: '4', title: 'History of East Africa', author: 'M. K. John', type: 'Book', source: 'MakLib', url: '#', year: 2018 },
                { id: '5', title: 'Data Structures Implementation', author: 'A. Tanenbaum', type: 'Book', source: 'OpenLibrary', url: '#', year: 2019 },
            ];
            
            if (!query) resolve(allResources);
            else {
                const lowerQ = query.toLowerCase();
                resolve(allResources.filter(r => r.title.toLowerCase().includes(lowerQ) || r.author.toLowerCase().includes(lowerQ)));
            }
        }, 600);
    });
}

export const fetchStudentPortalData = async (): Promise<{
    grades: StudentGrade[];
    timetable: TimetableEntry[];
    finance: FinancialStatus;
}> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                grades: [
                    { courseCode: 'CSC3101', courseTitle: 'Artificial Intelligence', grade: 'A', score: 85, credits: 4 },
                    { courseCode: 'CSC3102', courseTitle: 'Software Engineering', grade: 'B+', score: 78, credits: 4 },
                    { courseCode: 'MTH3100', courseTitle: 'Numerical Analysis', grade: 'A-', score: 81, credits: 3 },
                    { courseCode: 'BIT3104', courseTitle: 'Web Frameworks', grade: 'A', score: 90, credits: 4 },
                ],
                timetable: [
                    { id: '1', day: 'Monday', time: '08:00 - 10:00', course: 'CSC3101', room: 'Lab 3', type: 'Lecture' },
                    { id: '2', day: 'Monday', time: '14:00 - 16:00', course: 'BIT3104', room: 'Lab 1', type: 'Lab' },
                    { id: '3', day: 'Tuesday', time: '10:00 - 13:00', course: 'MTH3100', room: 'Room 4B', type: 'Lecture' },
                    { id: '4', day: 'Wednesday', time: '09:00 - 11:00', course: 'CSC3102', room: 'Main Hall', type: 'Lecture' },
                    { id: '5', day: 'Thursday', time: '14:00 - 17:00', course: 'Project Work', room: 'Hub', type: 'Tutorial' },
                ],
                finance: {
                    balance: 450000,
                    currency: 'UGX',
                    status: 'Pending',
                    nextDueDate: '2025-11-30',
                    history: [
                        { date: '2025-08-15', description: 'Tuition Payment', amount: -1500000 },
                        { date: '2025-08-01', description: 'Semester Fees Invoice', amount: 1950000 }
                    ]
                }
            });
        }, 800);
    });
}
