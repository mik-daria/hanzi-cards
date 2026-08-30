const databaseName = 'hanzi-cards-images'
const storeName = 'images'
const databaseVersion = 1

export const draftImageId = 'draft-image'

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, databaseVersion)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(storeName)) request.result.createObjectStore(storeName)
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Could not open image database'))
  })
}

async function runRequest<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const database = await openDatabase()
  try {
    return await new Promise<T>((resolve, reject) => {
      const transaction = database.transaction(storeName, mode)
      const request = action(transaction.objectStore(storeName))
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error ?? new Error('Image database request failed'))
      transaction.onabort = () => reject(transaction.error ?? new Error('Image database transaction was aborted'))
    })
  } finally {
    database.close()
  }
}

export function saveImage(imageId: string, image: Blob): Promise<IDBValidKey> {
  return runRequest('readwrite', (store) => store.put(image, imageId))
}

export async function getImage(imageId: string): Promise<Blob | undefined> {
  const value: unknown = await runRequest('readonly', (store) => store.get(imageId))
  return value instanceof Blob ? value : undefined
}

export async function deleteImage(imageId: string): Promise<void> {
  await runRequest('readwrite', (store) => store.delete(imageId))
}
