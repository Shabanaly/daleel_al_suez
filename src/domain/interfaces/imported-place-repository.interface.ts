export interface ImportedPlaceRepo {
    create(data: any): Promise<void>;
    getByGooglePlaceId(googlePlaceId: string): Promise<any | null>;
    listPending(): Promise<any[]>;
    updateStatus(id: string, status: string): Promise<void>;
    matchCategory(googleTypes: string[]): Promise<string | null>;
}
