import { Injectable } from '@nestjs/common';

@Injectable()
export class SearchService {
  async index(tid: string, collection: string, id: string, _data: any) {
    // Stub for Qdrant/Elasticsearch
    console.log(`Indexing ${id} in ${collection} for tenant ${tid}`);
  }

  async search(tid: string, collection: string, query: string) {
    console.log(`Searching ${query} in ${collection} for tenant ${tid}`);
    return [];
  }
}
