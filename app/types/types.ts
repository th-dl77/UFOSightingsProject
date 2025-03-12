export interface UFOSighting {
    id: number;
    witnessName: string;
    location: Location;
    description: string;
    picture: string | undefined;
    status: Status;
    dateTime: Date
    witnessContact: string;
}

export interface LocationHandlerProps {
    addMarker: (lat: number, lng: number) => void;
}

export interface Location {
    latitude: number;
    longitude: number;
}

export enum Status {
    Confirmed = "confirmed",
    Unconfirmed = "unconfirmed",
}