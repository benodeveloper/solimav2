import { db } from '@/src/db';
import { media } from '@/src/db/schema';
import { MediaCollection } from '@/src/enums/media-collection.enum';
import { eq, and } from 'drizzle-orm';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';

/**
 * Service for polymorphic media management inspired by Spatie Media Library.
 * Author: benodeveloper
 * Website: https://www.benodeveloper.com
 */
export class MediaService {
  private static UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');

  /**
   * Registers a file into the media table and saves it to disk.
   */
  static async addMedia(
    modelId: number,
    modelType: string,
    file: File,
    collection: MediaCollection
  ) {
    // Ensure upload directory exists
    await mkdir(this.UPLOAD_DIR, { recursive: true });

    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const filePath = join(this.UPLOAD_DIR, fileName);
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    await writeFile(filePath, buffer);

    // If it's a single-file collection like 'logo', delete previous one
    if (collection === MediaCollection.LOGO || collection === MediaCollection.AVATAR) {
        await this.clearMediaCollection(modelId, modelType, collection);
    }

    // Insert into DB
    const [result] = await db.insert(media).values({
      model_id: modelId,
      model_type: modelType,
      collection_name: collection,
      name: file.name,
      file_name: fileName,
      mime_type: file.type,
      size: file.size,
      disk: 'public',
      generated_conversions: JSON.stringify({
        thumbnail: `/uploads/${fileName}`, // Placeholder for real conversions
        original: `/uploads/${fileName}`
      })
    });

    return result;
  }

  /**
   * Retrieves media for a specific model and collection.
   */
  static async getMedia(modelId: number, modelType: string, collection?: MediaCollection) {
    const filters = [
        eq(media.model_id, modelId),
        eq(media.model_type, modelType)
    ];

    if (collection) {
        filters.push(eq(media.collection_name, collection));
    }

    return await db.select().from(media).where(and(...filters));
  }

  /**
   * Gets a single media item for collections that only allow one file.
   */
  static async getFirstMedia(modelId: number, modelType: string, collection: MediaCollection) {
    const results = await this.getMedia(modelId, modelType, collection);
    return results[0] || null;
  }

  /**
   * Deletes all media for a specific collection on a model.
   */
  static async clearMediaCollection(modelId: number, modelType: string, collection: MediaCollection) {
    const items = await this.getMedia(modelId, modelType, collection);
    
    for (const item of items) {
        try {
            await unlink(join(this.UPLOAD_DIR, item.file_name));
        } catch (e) {
            // File might not exist
        }
    }

    await db.delete(media).where(and(
        eq(media.model_id, modelId),
        eq(media.model_type, modelType),
        eq(media.collection_name, collection)
    ));
  }
}
