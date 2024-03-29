import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { query, where } from '@angular/fire/firestore';
import { collection, getDocs } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  userdb = this.db.collection('user');
  eventdb = this.db.collection('event');
  allEvents = new BehaviorSubject<any>([]);
  selectedEvent = new BehaviorSubject<any>('');

  constructor(
    private db: AngularFirestore,
    private nativeStorage: NativeStorage
  ) {
    this.loadEventsBasedOnMonth('09');
  }

  ngOnInit() {
    this.loadAllEvents();
  }

  saveUser(uid, email, password, name) {
    this.userdb.doc(uid).set({
      email: email,
      password: password,
      name: name,
      isAdmin: false,
    });
  }
  saveEvent(newEvent) {
    let user = JSON.parse(localStorage.getItem('user'));
    let event = {
      creatorID: user.uid,
      name: newEvent.name,
      date: newEvent.date,
      dateDetermination: newEvent.dateDetermination,
      religious: newEvent.religious,
      eventType: newEvent.eventType,
      canadaObservedPlace: newEvent.canadaObservedPlace,
      reason: newEvent.reason,
      activity: newEvent.activity,
      isApproved: false,
      isPopular: false,
      isApprovedBy: '',
    };
    console.log(event);

    this.eventdb.add(event);
  }

  //*** TO_DO *** This method is for reference
  async loadEventsBasedOnMonth(mm: string) {
    let events = [];
    const db = getFirestore();
    const eventRef = collection(db, 'event');
    // *** TO_DO *** Change the filter isApproved to true
    const q = query(
      eventRef,
      where('isApproved', '==', false),
      where('dateMM', '==', mm)
    );
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      events.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return events;
  }

  async loadAllEvents() {
    this.nativeStorage.getItem('allEvents').then(
      data => {
        console.log("Events are found in native storage");
        console.log(data);
        this.allEvents.next(data);
    },
      async error => {
        console.log("Events are not found in native storage");
        let events = [];
          const db = getFirestore();
          const eventRef = collection(db, 'event');
          const q = query(eventRef, where('isApproved', '==', true));
          const querySnapshot = await getDocs(q);
    
          querySnapshot.forEach((doc) => {
            events.push({
              id: doc.id,
              ...doc.data(),
            });
          });
    
          this.allEvents.next(events);
          this.nativeStorage.setItem('allEvents', events).then(
            () => console.log('Stored item!'),
            error => console.log('Error storing item', error)
          );
      }
    );
  }

  updateSelectedEvent(event: any) {
    this.selectedEvent.next(event);
  }
}
