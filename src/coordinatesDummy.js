import AsyncStorage from "@react-native-async-storage/async-storage"
import { getAllParkomats } from "./services/requests"

import haversine from 'haversine-distance'

const getUserCoordinates = async () => {
    try {
        const jsonString = await AsyncStorage.getItem('userLocation');
        if (jsonString !== null) {
            const {lat,lon} = JSON.parse(jsonString);
            const userCoordinates = {latitude:lat,longitude:lon}
        return userCoordinates
          }
        } 
     catch (error) {
        console.error('Error reading object from AsyncStorage:', error);
    }
}


export const asdsad =async (a) => {
    const res = await getAllParkomats();
    const coordinates = await getUserCoordinates();


 
    const itemsList = res.data.map(e=>{
        return {
            latitude:e.location.coordinate.lat,
            longitude:e.location.coordinate.lon,
            address:e.location.address,
            distance:coordinates?Math.floor(haversine( { latitude: e.location.coordinate.lat, longitude:e.location.coordinate.lon },coordinates )) + 'm from you':'0 m',
        }
    })
    
    return itemsList
}


