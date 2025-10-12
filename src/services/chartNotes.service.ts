import { axiosPrivate } from './axios';
import type { AxiosResponse } from 'axios';

// Types/Interfaces
export interface ChartNoteAuthor {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

export interface ChartNote {
  id: string;
  content: string;
  chartId: string;
  authorId: string;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  author: ChartNoteAuthor;
}

export interface CreateChartNoteDto {
  chartId: string;
  content: string;
}

export interface UpdateChartNoteDto {
  content: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

// Chart Notes Service
class ChartNotesService {
  private readonly baseURL = '/chart-notes';

  /**
   * Tạo note mới cho chart
   * @param createDto - Dữ liệu tạo note (chartId, content)
   * @returns Promise<ChartNote>
   */
  async createNote(createDto: CreateChartNoteDto): Promise<ChartNote> {
    try {
      const response: AxiosResponse<ApiResponse<ChartNote>> = await axiosPrivate.post(
        this.baseURL,
        createDto
      );
      return response.data.data;
    } catch (error) {
      console.error('Error creating chart note:', error);
      throw error;
    }
  }

  /**
   * Lấy tất cả notes của một chart
   * @param chartId - ID của chart
   * @returns Promise<ChartNote[]>
   */
  async getNotesByChartId(chartId: string): Promise<ChartNote[]> {
    try {
      const response: AxiosResponse<ApiResponse<ChartNote[]>> = await axiosPrivate.get(
        `${this.baseURL}/chart/${chartId}`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching chart notes:', error);
      throw error;
    }
  }

  /**
   * Lấy một note cụ thể theo ID
   * @param noteId - ID của note
   * @returns Promise<ChartNote>
   */
  async getNoteById(noteId: string): Promise<ChartNote> {
    try {
      const response: AxiosResponse<ApiResponse<ChartNote>> = await axiosPrivate.get(
        `${this.baseURL}/${noteId}`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching chart note:', error);
      throw error;
    }
  }

  /**
   * Cập nhật note
   * @param noteId - ID của note cần cập nhật
   * @param updateDto - Dữ liệu cập nhật (content)
   * @returns Promise<ChartNote>
   */
  async updateNote(noteId: string, updateDto: UpdateChartNoteDto): Promise<ChartNote> {
    try {
      const response: AxiosResponse<ApiResponse<ChartNote>> = await axiosPrivate.patch(
        `${this.baseURL}/${noteId}`,
        updateDto
      );
      return response.data.data;
    } catch (error) {
      console.error('Error updating chart note:', error);
      throw error;
    }
  }

  /**
   * Xóa note (soft delete)
   * @param noteId - ID của note cần xóa
   * @returns Promise<{message: string}>
   */
  async deleteNote(noteId: string): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<ApiResponse<{ message: string }>> = await axiosPrivate.delete(
        `${this.baseURL}/${noteId}`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error deleting chart note:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const chartNotesService = new ChartNotesService();
export default chartNotesService;
