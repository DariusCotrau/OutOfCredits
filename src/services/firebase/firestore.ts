import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import {
  FirestoreDocument,
  FirestoreQuery,
  FirestoreOrder,
  FirestorePagination,
  FirestoreBatchOperation,
  ServiceResult,
  AsyncServiceResult,
} from './types';
export const Collections = {
  USERS: 'users',
  USAGE_STATS: 'usageStats',
  APP_USAGE: 'appUsage',
  GOALS: 'goals',
  ACTIVITIES: 'activities',
  BADGES: 'badges',
  NOTIFICATIONS: 'notifications',
  FRIENDS: 'friends',
  LEADERBOARD: 'leaderboard',
  STREAKS: 'streaks',
  MEDITATIONS: 'meditations',
  APP_LIMITS: 'appLimits',
  USER_SETTINGS: 'userSettings',
} as const;
export type CollectionName = (typeof Collections)[keyof typeof Collections];
class FirestoreService {
  collection(collection: CollectionName) {
    return firestore().collection(collection);
  }
  doc(collection: CollectionName, documentId: string) {
    return firestore().collection(collection).doc(documentId);
  }
  async add<T extends object>(
    collection: CollectionName,
    data: T
  ): AsyncServiceResult<string> {
    try {
      const docRef = await firestore()
        .collection(collection)
        .add({
          ...data,
          createdAt: firestore.FieldValue.serverTimestamp(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
      return {
        success: true,
        data: docRef.id,
      };
    } catch (error) {
      console.error('[FirestoreService] Add error:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }
  async set<T extends object>(
    collection: CollectionName,
    documentId: string,
    data: T,
    merge = false
  ): AsyncServiceResult<void> {
    try {
      const docData = {
        ...data,
        updatedAt: firestore.FieldValue.serverTimestamp(),
        ...(merge ? {} : { createdAt: firestore.FieldValue.serverTimestamp() }),
      };
      await firestore()
        .collection(collection)
        .doc(documentId)
        .set(docData, { merge });
      return {
        success: true,
      };
    } catch (error) {
      console.error('[FirestoreService] Set error:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }
  async update<T extends object>(
    collection: CollectionName,
    documentId: string,
    data: T
  ): AsyncServiceResult<void> {
    try {
      await firestore()
        .collection(collection)
        .doc(documentId)
        .update({
          ...data,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
      return {
        success: true,
      };
    } catch (error) {
      console.error('[FirestoreService] Update error:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }
  async delete(
    collection: CollectionName,
    documentId: string
  ): AsyncServiceResult<void> {
    try {
      await firestore().collection(collection).doc(documentId).delete();
      return {
        success: true,
      };
    } catch (error) {
      console.error('[FirestoreService] Delete error:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }
  async get<T>(
    collection: CollectionName,
    documentId: string
  ): AsyncServiceResult<T & FirestoreDocument> {
    try {
      const doc = await firestore()
        .collection(collection)
        .doc(documentId)
        .get();
      if (!doc.exists) {
        return {
          success: false,
          error: 'Document not found',
        };
      }
      const data = doc.data() as T & Omit<FirestoreDocument, 'id'>;
      return {
        success: true,
        data: {
          id: doc.id,
          ...data,
        } as T & FirestoreDocument,
      };
    } catch (error) {
      console.error('[FirestoreService] Get error:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }
  async query<T>(
    collection: CollectionName,
    queries: FirestoreQuery[] = [],
    order?: FirestoreOrder,
    pagination?: FirestorePagination
  ): AsyncServiceResult<(T & FirestoreDocument)[]> {
    try {
      let query: FirebaseFirestoreTypes.Query = firestore().collection(
        collection
      );
      for (const q of queries) {
        query = query.where(q.field, q.operator, q.value);
      }
      if (order) {
        query = query.orderBy(order.field, order.direction);
      }
      if (pagination) {
        if (pagination.startAfter) {
          query = query.startAfter(pagination.startAfter);
        }
        query = query.limit(pagination.limit);
      }
      const snapshot = await query.get();
      const documents = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as T & Omit<FirestoreDocument, 'id'>),
      })) as (T & FirestoreDocument)[];
      return {
        success: true,
        data: documents,
      };
    } catch (error) {
      console.error('[FirestoreService] Query error:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }
  async getAll<T>(
    collection: CollectionName,
    limit?: number
  ): AsyncServiceResult<(T & FirestoreDocument)[]> {
    try {
      let query: FirebaseFirestoreTypes.Query = firestore().collection(
        collection
      );
      if (limit) {
        query = query.limit(limit);
      }
      const snapshot = await query.get();
      const documents = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as T & Omit<FirestoreDocument, 'id'>),
      })) as (T & FirestoreDocument)[];
      return {
        success: true,
        data: documents,
      };
    } catch (error) {
      console.error('[FirestoreService] GetAll error:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }
  subscribeToDoc<T>(
    collection: CollectionName,
    documentId: string,
    onData: (data: (T & FirestoreDocument) | null) => void,
    onError?: (error: Error) => void
  ): () => void {
    return firestore()
      .collection(collection)
      .doc(documentId)
      .onSnapshot(
        (doc) => {
          if (doc.exists) {
            const data = doc.data() as T & Omit<FirestoreDocument, 'id'>;
            onData({
              id: doc.id,
              ...data,
            } as T & FirestoreDocument);
          } else {
            onData(null);
          }
        },
        (error) => {
          console.error('[FirestoreService] Subscribe error:', error);
          onError?.(error);
        }
      );
  }
  subscribeToQuery<T>(
    collection: CollectionName,
    queries: FirestoreQuery[],
    onData: (data: (T & FirestoreDocument)[]) => void,
    onError?: (error: Error) => void,
    order?: FirestoreOrder,
    limit?: number
  ): () => void {
    let query: FirebaseFirestoreTypes.Query = firestore().collection(collection);
    for (const q of queries) {
      query = query.where(q.field, q.operator, q.value);
    }
    if (order) {
      query = query.orderBy(order.field, order.direction);
    }
    if (limit) {
      query = query.limit(limit);
    }
    return query.onSnapshot(
      (snapshot) => {
        const documents = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as T & Omit<FirestoreDocument, 'id'>),
        })) as (T & FirestoreDocument)[];
        onData(documents);
      },
      (error) => {
        console.error('[FirestoreService] Subscribe query error:', error);
        onError?.(error);
      }
    );
  }
  async batch(operations: FirestoreBatchOperation[]): AsyncServiceResult<void> {
    try {
      const batch = firestore().batch();
      for (const op of operations) {
        const [collection, ...rest] = op.path.split('/');
        const docId = rest.join('/');
        const docRef = firestore().collection(collection).doc(docId);
        switch (op.type) {
          case 'set':
            batch.set(
              docRef,
              {
                ...op.data,
                updatedAt: firestore.FieldValue.serverTimestamp(),
              },
              { merge: op.merge ?? false }
            );
            break;
          case 'update':
            batch.update(docRef, {
              ...op.data,
              updatedAt: firestore.FieldValue.serverTimestamp(),
            });
            break;
          case 'delete':
            batch.delete(docRef);
            break;
        }
      }
      await batch.commit();
      return {
        success: true,
      };
    } catch (error) {
      console.error('[FirestoreService] Batch error:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }
  async increment(
    collection: CollectionName,
    documentId: string,
    field: string,
    value: number
  ): AsyncServiceResult<void> {
    try {
      await firestore()
        .collection(collection)
        .doc(documentId)
        .update({
          [field]: firestore.FieldValue.increment(value),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
      return {
        success: true,
      };
    } catch (error) {
      console.error('[FirestoreService] Increment error:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }
  async arrayUnion(
    collection: CollectionName,
    documentId: string,
    field: string,
    value: unknown
  ): AsyncServiceResult<void> {
    try {
      await firestore()
        .collection(collection)
        .doc(documentId)
        .update({
          [field]: firestore.FieldValue.arrayUnion(value),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
      return {
        success: true,
      };
    } catch (error) {
      console.error('[FirestoreService] ArrayUnion error:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }
  async arrayRemove(
    collection: CollectionName,
    documentId: string,
    field: string,
    value: unknown
  ): AsyncServiceResult<void> {
    try {
      await firestore()
        .collection(collection)
        .doc(documentId)
        .update({
          [field]: firestore.FieldValue.arrayRemove(value),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
      return {
        success: true,
      };
    } catch (error) {
      console.error('[FirestoreService] ArrayRemove error:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }
  serverTimestamp() {
    return firestore.FieldValue.serverTimestamp();
  }
  timestamp(date: Date) {
    return firestore.Timestamp.fromDate(date);
  }
}
export const firestoreService = new FirestoreService();
