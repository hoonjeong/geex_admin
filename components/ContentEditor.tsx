import { useRef, useEffect, useState, MouseEvent, ClipboardEvent, forwardRef, useImperativeHandle } from 'react';
import { Box, ToggleButton, ToggleButtonGroup, Divider } from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatListBulleted,
  FormatListNumbered,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  FormatColorText,
  FormatColorFill,
} from '@mui/icons-material';

interface ContentEditorProps {
  value: string;
  onChange: (content: string) => void;
  readOnly?: boolean;
  autoFocus?: boolean;
}

export interface ContentEditorRef {
  focus: () => void;
}

const ContentEditor = forwardRef<ContentEditorRef, ContentEditorProps>(({ value, onChange, readOnly = false, autoFocus = false }, ref) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [formats, setFormats] = useState<string[]>([]);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  useEffect(() => {
    if (autoFocus && editorRef.current && !readOnly) {
      editorRef.current.focus();
    }
  }, [autoFocus, readOnly]);

  useImperativeHandle(ref, () => ({
    focus: () => {
      if (editorRef.current && !readOnly) {
        editorRef.current.focus();
      }
    }
  }), [readOnly]);

  const handleFormat = (event: MouseEvent<HTMLElement>, newFormats: string[]) => {
    event.preventDefault();
    setFormats(newFormats);
  };

  const applyFormat = (command: string, value?: string) => {
    if (!readOnly) {
      document.execCommand(command, false, value);
      editorRef.current?.focus();
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handlePaste = (e: ClipboardEvent) => {
    if (!readOnly) {
      e.preventDefault();
      const html = e.clipboardData.getData('text/html');
      const text = e.clipboardData.getData('text/plain');
      
      if (html) {
        // HTML 내용을 정리하여 붙여넣기
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // 스타일 속성 유지하면서 붙여넣기
        document.execCommand('insertHTML', false, tempDiv.innerHTML);
      } else {
        document.execCommand('insertText', false, text);
      }
      
      handleInput();
    }
  };

  if (readOnly) {
    return (
      <Box
        sx={{
          p: 2,
          minHeight: 150,
          border: '1px solid #ccc',
          borderRadius: 1,
          backgroundColor: '#f5f5f5',
        }}
        dangerouslySetInnerHTML={{ __html: value }}
      />
    );
  }

  return (
    <Box sx={{ border: '1px solid #ccc', borderRadius: 1 }}>
      <Box sx={{ p: 1, backgroundColor: '#f5f5f5', borderBottom: '1px solid #ccc' }}>
        <ToggleButtonGroup
          value={formats}
          onChange={handleFormat}
          size="small"
          sx={{ flexWrap: 'wrap', gap: 0.5 }}
        >
          <ToggleButton
            value="bold"
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat('bold');
            }}
          >
            <FormatBold fontSize="small" />
          </ToggleButton>
          <ToggleButton
            value="italic"
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat('italic');
            }}
          >
            <FormatItalic fontSize="small" />
          </ToggleButton>
          <ToggleButton
            value="underline"
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat('underline');
            }}
          >
            <FormatUnderlined fontSize="small" />
          </ToggleButton>
          
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          
          <ToggleButton
            value="insertUnorderedList"
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat('insertUnorderedList');
            }}
          >
            <FormatListBulleted fontSize="small" />
          </ToggleButton>
          <ToggleButton
            value="insertOrderedList"
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat('insertOrderedList');
            }}
          >
            <FormatListNumbered fontSize="small" />
          </ToggleButton>
          
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          
          <ToggleButton
            value="justifyLeft"
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat('justifyLeft');
            }}
          >
            <FormatAlignLeft fontSize="small" />
          </ToggleButton>
          <ToggleButton
            value="justifyCenter"
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat('justifyCenter');
            }}
          >
            <FormatAlignCenter fontSize="small" />
          </ToggleButton>
          <ToggleButton
            value="justifyRight"
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat('justifyRight');
            }}
          >
            <FormatAlignRight fontSize="small" />
          </ToggleButton>
          
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          
          <input
            type="color"
            style={{ width: 30, height: 28, border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer' }}
            onChange={(e) => applyFormat('foreColor', e.target.value)}
            title="텍스트 색상"
          />
          <input
            type="color"
            style={{ width: 30, height: 28, border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer' }}
            onChange={(e) => applyFormat('hiliteColor', e.target.value)}
            title="배경 색상"
          />
        </ToggleButtonGroup>
      </Box>
      
      <Box
        ref={editorRef}
        contentEditable={!readOnly}
        suppressContentEditableWarning={true}
        onInput={handleInput}
        onPaste={handlePaste}
        sx={{
          p: 2,
          minHeight: 150,
          outline: 'none',
          backgroundColor: '#fff',
          '&:focus': {
            outline: '2px solid #1976d2',
            outlineOffset: -2,
          },
          '& *': {
            maxWidth: '100%',
          },
          '& img': {
            maxWidth: '100%',
            height: 'auto',
          },
          '& table': {
            borderCollapse: 'collapse',
            width: '100%',
          },
          '& td, & th': {
            border: '1px solid #ddd',
            padding: '8px',
          },
        }}
        dangerouslySetInnerHTML={{ __html: value }}
      />
    </Box>
  );
});

ContentEditor.displayName = 'ContentEditor';

export default ContentEditor;