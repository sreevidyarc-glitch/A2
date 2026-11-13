// ====================================================================
// AdaptiveLearn AI — Server Document Parser
// Extracts structured text from PDF, DOCX, and TXT files
// ====================================================================

import mammoth from 'mammoth';

export interface ParseResult {
  success: boolean;
  text: string;
  wordCount: number;
  characterCount: number;
  error?: string;
}

/**
 * Parses and cleans uploaded buffer into plain readable academic text.
 */
export async function parseDocumentBuffer(
  buffer: Buffer,
  fileType: 'pdf' | 'docx' | 'pptx' | 'ppt' | 'txt'
): Promise<ParseResult> {
  try {
    let extractedText = '';

    if (fileType === 'pdf') {
      // Dynamic import of pdf-parse to avoid node bundling issues
      const pdfParse = (await import('pdf-parse')).default;
      const data = await pdfParse(buffer);
      extractedText = data.text;
    } else if (fileType === 'docx') {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    } else if (fileType === 'txt') {
      extractedText = buffer.toString('utf-8');
    } else if (fileType === 'pptx' || fileType === 'ppt') {
      // Extract string runs from slide XML buffers
      const rawString = buffer.toString('utf-8', 0, Math.min(buffer.length, 500000));
      const textMatches = rawString.match(/<a:t>([^<]+)<\/a:t>/g) || [];
      if (textMatches.length > 0) {
        extractedText = textMatches.map(m => m.replace(/<\/?a:t>/g, '')).join(' ');
      } else {
        // Fallback ASCII extraction
        extractedText = buffer
          .toString('ascii')
          .replace(/[^\x20-\x7E\t\n\r]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      }
    }

    // Sanitize and clean whitespace
    const cleanedText = extractedText
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    const words = cleanedText.split(/\s+/).filter(Boolean);

    if (cleanedText.length < 20) {
      return {
        success: false,
        text: '',
        wordCount: 0,
        characterCount: 0,
        error: 'Extracted text is too short or file could not be parsed as text.',
      };
    }

    return {
      success: true,
      text: cleanedText,
      wordCount: words.length,
      characterCount: cleanedText.length,
    };
  } catch (err: any) {
    console.error('Document parsing error:', err);
    return {
      success: false,
      text: '',
      wordCount: 0,
      characterCount: 0,
      error: err.message || 'Unknown parsing failure',
    };
  }
}
