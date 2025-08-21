import { useState, useEffect, ChangeEvent, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Divider,
  Alert,
  AppBar,
  Toolbar,
  SelectChangeEvent,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Backdrop,
  TextField,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { Edit, Save, Add, Delete, Logout, PictureAsPdf } from '@mui/icons-material';
import ContentEditor, { ContentEditorRef } from '@/components/ContentEditor';

interface ClassContent {
  id?: number;
  content: string;
  answer: string;
  question_num: number;
  content_type: string;
  test_id?: number;
  isNew?: boolean;
  isEditing?: boolean;
  isChecked?: boolean;
}

interface TestInfo {
  id: number;
  year: number;
  month: number;
  grade: number;
  info?: string;
}

export default function ContentInsert() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [testInfo, setTestInfo] = useState<TestInfo | null>(null);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<number>(3);
  const [grade, setGrade] = useState<number>(1);
  const [contents, setContents] = useState<ClassContent[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const contentEditorsRef = useRef<{ [key: number]: ContentEditorRef | null }>({});

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleLogout = async () => {
    await logout();
  };

  const handleSearch = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    setLoadingMessage('조회중입니다...');
    
    try {
      const response = await fetch('/api/test/get-test-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, month, grade }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setTestInfo(data.testInfo);
      setContents(data.contents.map((c: ClassContent) => ({ ...c, isEditing: false, isChecked: false })));
      setMessage(`${year}년 ${month}월 고${grade} 데이터를 불러왔습니다.`);
      setSelectAll(false);
    } catch (err: any) {
      setError(err.message || '조회 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleAddContent = () => {
    const newContent: ClassContent = {
      content: '',
      answer: '',
      question_num: 18,
      content_type: '유형1',
      isNew: true,
      isEditing: true,
      test_id: testInfo?.id,
      isChecked: false,
    };
    const newIndex = contents.length;
    setContents([...contents, newContent]);
    
    // 새 컨텐츠 추가 후 포커스
    setTimeout(() => {
      contentEditorsRef.current[newIndex]?.focus();
    }, 100);
  };

  const handleEditContent = (index: number) => {
    const updatedContents = [...contents];
    updatedContents[index].isEditing = true;
    setContents(updatedContents);
  };

  const handleSaveEdit = async (index: number) => {
    const content = contents[index];
    
    if (!content.isNew && content.id) {
      setLoading(true);
      setLoadingMessage('수정중입니다...');
      try {
        const response = await fetch('/api/test/update-content', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: content.id,
            content: content.content,
            answer: content.answer,
            question_num: content.question_num,
            content_type: content.content_type,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error);
        }

        const updatedContents = [...contents];
        updatedContents[index].isEditing = false;
        setContents(updatedContents);
        setMessage('수정되었습니다.');
      } catch (err: any) {
        setError(err.message || '수정 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
        setLoadingMessage('');
      }
    } else {
      const updatedContents = [...contents];
      updatedContents[index].isEditing = false;
      setContents(updatedContents);
    }
  };

  const handleDeleteContent = (index: number) => {
    const content = contents[index];
    if (content.isNew) {
      // 새로 추가한 컨텐츠는 바로 삭제
      const updatedContents = contents.filter((_, i) => i !== index);
      setContents(updatedContents);
    } else if (content.id) {
      // 기존 컨텐츠는 확인 다이얼로그 표시
      setDeleteTargetId(content.id);
      setDeleteDialogOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    
    setLoading(true);
    setLoadingMessage('삭제중입니다...');
    setDeleteDialogOpen(false);
    
    try {
      const response = await fetch('/api/test/delete-content', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteTargetId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      setMessage('컨텐츠가 삭제되었습니다.');
      handleSearch(); // 목록 새로고침
    } catch (err: any) {
      setError(err.message || '삭제 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
      setLoadingMessage('');
      setDeleteTargetId(null);
    }
  };

  const handleContentChange = (index: number, field: keyof ClassContent, value: any) => {
    const updatedContents = [...contents];
    updatedContents[index] = { ...updatedContents[index], [field]: value };
    setContents(updatedContents);
  };

  const handleSaveNewContents = async () => {
    const newContents = contents.filter(c => c.isNew && !c.isEditing);
    
    if (newContents.length === 0) {
      setError('저장할 새 컨텐츠가 없습니다.');
      return;
    }

    if (!testInfo?.id) {
      setError('테스트 정보를 먼저 조회해주세요.');
      return;
    }

    setLoading(true);
    setLoadingMessage('저장중입니다...');

    try {
      const response = await fetch('/api/test/save-contents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          test_id: testInfo.id,
          contents: newContents.map(c => ({
            content: c.content,
            answer: c.answer,
            question_num: c.question_num,
            content_type: c.content_type,
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setMessage(`${newContents.length}개의 컨텐츠가 저장되었습니다.`);
      
      // Refresh the data
      handleSearch();
    } catch (err: any) {
      setError(err.message || '저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1999 }, (_, i) => currentYear - i);
  const months = [3, 4, 6, 7, 9, 11];
  const grades = [1, 2, 3];
  const questionNums = Array.from({ length: 28 }, (_, i) => i + 18);
  const contentTypes = ['유형1', '유형2', '유형3', '유형4', '유형5'];

  const handleSelectAll = (event: ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setSelectAll(checked);
    const updatedContents = contents.map(content => ({ ...content, isChecked: checked }));
    setContents(updatedContents);
  };

  const handleCheckContent = (index: number) => {
    const updatedContents = [...contents];
    updatedContents[index].isChecked = !updatedContents[index].isChecked;
    setContents(updatedContents);
    
    const allChecked = updatedContents.every(c => c.isChecked);
    setSelectAll(allChecked);
  };

  const handleGeneratePDF = async () => {
    const checkedContents = contents.filter(c => c.isChecked && !c.isNew);
    
    if (checkedContents.length === 0) {
      setError('PDF로 저장할 컨텐츠를 선택해주세요.');
      return;
    }

    setLoading(true);
    setLoadingMessage('PDF 생성중입니다...');

    try {
      // html2pdf.js 동적 로드
      const html2pdf = (await import('html2pdf.js')).default;
      
      // PDF용 HTML 컨텐츠 생성
      const pdfContent = document.createElement('div');
      pdfContent.style.padding = '20px';
      pdfContent.style.fontFamily = 'Malgun Gothic, 맑은 고딕, sans-serif';
      
      // 타이틀 추가
      const title = document.createElement('h1');
      title.style.textAlign = 'center';
      title.style.fontSize = '24px';
      title.style.marginBottom = '30px';
      title.textContent = `${year}년 ${month}월 고${grade} 변형자료`;
      pdfContent.appendChild(title);
      
      // 컨텐츠 추가
      checkedContents.forEach((content, index) => {
        // 컨텐츠 컨테이너
        const contentDiv = document.createElement('div');
        contentDiv.style.marginBottom = '30px';
        if (index > 0) {
          contentDiv.style.pageBreakInside = 'avoid';
        }
        
        // 문항번호 (순서대로 번호 부여)
        const questionNum = document.createElement('h3');
        questionNum.style.fontSize = '16px';
        questionNum.style.marginBottom = '10px';
        questionNum.style.color = '#333';
        questionNum.textContent = `${index + 1}. 문항 ${content.question_num}번`;
        contentDiv.appendChild(questionNum);
        
        // 컨텐츠 본문
        const contentBody = document.createElement('div');
        contentBody.style.fontSize = '14px';
        contentBody.style.lineHeight = '1.6';
        contentBody.style.color = '#444';
        contentBody.innerHTML = content.content;
        
        // 테이블 스타일 적용
        const tables = contentBody.querySelectorAll('table');
        tables.forEach(table => {
          (table as HTMLElement).style.width = '100%';
          (table as HTMLElement).style.borderCollapse = 'collapse';
          (table as HTMLElement).style.marginBottom = '10px';
        });
        
        const tableCells = contentBody.querySelectorAll('td, th');
        tableCells.forEach(cell => {
          (cell as HTMLElement).style.border = '1px solid #ddd';
          (cell as HTMLElement).style.padding = '8px';
        });
        
        contentDiv.appendChild(contentBody);
        
        // 구분선
        if (index < checkedContents.length - 1) {
          const hr = document.createElement('hr');
          hr.style.margin = '20px 0';
          hr.style.border = 'none';
          hr.style.borderTop = '1px solid #e0e0e0';
          contentDiv.appendChild(hr);
        }
        
        pdfContent.appendChild(contentDiv);
      });
      
      // 정답 페이지 추가
      const answerPage = document.createElement('div');
      answerPage.style.pageBreakBefore = 'always';
      answerPage.style.padding = '20px';
      answerPage.style.fontFamily = 'Malgun Gothic, 맑은 고딕, sans-serif';
      
      const answerTitle = document.createElement('h2');
      answerTitle.style.fontSize = '20px';
      answerTitle.style.marginBottom = '20px';
      answerTitle.style.textAlign = 'center';
      answerTitle.textContent = '[정답]';
      answerPage.appendChild(answerTitle);
      
      checkedContents.forEach((content, index) => {
        const answerItem = document.createElement('div');
        answerItem.style.marginBottom = '10px';
        answerItem.style.fontSize = '14px';
        answerItem.style.lineHeight = '1.6';
        answerItem.textContent = `${index + 1}. ${content.answer || '(정답 없음)'}`;
        answerPage.appendChild(answerItem);
      });
      
      pdfContent.appendChild(answerPage);
      
      // PDF 옵션 설정
      const opt = {
        margin: 10,
        filename: `${year}_${month}_고${grade}_변형자료.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true,
          logging: false
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };
      
      // PDF 생성 및 다운로드
      await html2pdf().set(opt).from(pdfContent).save();
      
      setMessage('PDF가 생성되었습니다.');
    } catch (err: any) {
      console.error('PDF generation error:', err);
      setError('PDF 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const hasCheckedContents = contents.some(c => c.isChecked && !c.isNew);

  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>로딩 중...</Typography>
      </Box>
    );
  }

  return (
    <>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress color="inherit" />
          <Typography sx={{ mt: 2 }}>{loadingMessage}</Typography>
        </Box>
      </Backdrop>
      <AppBar position="static" sx={{ bgcolor: 'white', color: 'text.primary' }} elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 500 }}>
            컨텐츠 입력
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.email}
          </Typography>
          <IconButton
            size="large"
            edge="end"
            color="inherit"
            aria-label="logout"
            onClick={handleLogout}
          >
            <Logout />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontSize: '1.1rem' }}>
            모의고사 시행일시 정보
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>년도</InputLabel>
              <Select
                value={year}
                label="년도"
                onChange={(e: SelectChangeEvent<number>) => setYear(Number(e.target.value))}
              >
                {years.map(y => (
                  <MenuItem key={y} value={y}>{y}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 80 }}>
              <InputLabel>월</InputLabel>
              <Select
                value={month}
                label="월"
                onChange={(e: SelectChangeEvent<number>) => setMonth(Number(e.target.value))}
              >
                {months.map(m => (
                  <MenuItem key={m} value={m}>{m}월</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 80 }}>
              <InputLabel>학년</InputLabel>
              <Select
                value={grade}
                label="학년"
                onChange={(e: SelectChangeEvent<number>) => setGrade(Number(e.target.value))}
              >
                {grades.map(g => (
                  <MenuItem key={g} value={g}>고{g}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Button variant="contained" size="medium" onClick={handleSearch} sx={{ height: 40 }}>
              조회
            </Button>
            <Button variant="outlined" size="medium" onClick={handleAddContent} startIcon={<Add />} sx={{ height: 40 }}>
              내용추가
            </Button>
          </Box>
        </Paper>

        {message && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage('')}>
            {message}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {testInfo && (
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectAll}
                    onChange={handleSelectAll}
                    indeterminate={contents.some(c => c.isChecked) && !selectAll}
                  />
                }
                label="전체 선택"
              />
            </Box>
            
            {contents.map((content, index) => (
              <Card 
                key={index} 
                sx={{ 
                  mb: 3, 
                  bgcolor: content.isNew ? '#f0f7ff' : '#ffffff',
                  border: content.isNew ? '2px dashed #1976d2' : '1px solid #e0e0e0',
                  boxShadow: content.isEditing ? 3 : 1,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: 3,
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                    <Chip 
                      label={`#${index + 1}`} 
                      color={content.isNew ? "primary" : "default"}
                      variant={content.isNew ? "filled" : "outlined"}
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                    
                    {!content.isNew && (
                      <Checkbox
                        checked={content.isChecked || false}
                        onChange={() => handleCheckContent(index)}
                      />
                    )}
                    
                    <FormControl size="small" sx={{ minWidth: 100 }}>
                      <InputLabel>문항번호</InputLabel>
                      <Select
                        value={content.question_num}
                        label="문항번호"
                        disabled={!content.isEditing}
                        onChange={(e) => handleContentChange(index, 'question_num', Number(e.target.value))}
                      >
                        {questionNums.map(num => (
                          <MenuItem key={num} value={num}>{num}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 100 }}>
                      <InputLabel>자료유형</InputLabel>
                      <Select
                        value={content.content_type}
                        label="자료유형"
                        disabled={!content.isEditing}
                        onChange={(e) => handleContentChange(index, 'content_type', e.target.value)}
                      >
                        {contentTypes.map(type => (
                          <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {content.isNew && (
                      <Chip label="새 컨텐츠" color="primary" size="small" />
                    )}

                    <Box sx={{ flexGrow: 1 }} />

                    {content.isEditing ? (
                      <>
                        <IconButton onClick={() => handleSaveEdit(index)} color="primary" title="저장">
                          <Save />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteContent(index)} color="error" title="삭제">
                          <Delete />
                        </IconButton>
                      </>
                    ) : (
                      <>
                        <IconButton onClick={() => handleEditContent(index)} color="primary" title="수정">
                          <Edit />
                        </IconButton>
                        {!content.isNew && (
                          <IconButton onClick={() => handleDeleteContent(index)} color="error" title="삭제">
                            <Delete />
                          </IconButton>
                        )}
                      </>
                    )}
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  <ContentEditor
                    ref={(el) => contentEditorsRef.current[index] = el}
                    value={content.content}
                    onChange={(value) => handleContentChange(index, 'content', value)}
                    readOnly={!content.isEditing}
                    autoFocus={content.isNew && content.isEditing}
                  />
                  
                  <Box sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      label="정답"
                      value={content.answer || ''}
                      onChange={(e) => handleContentChange(index, 'answer', e.target.value)}
                      disabled={!content.isEditing}
                      placeholder="정답을 입력하세요"
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                </CardContent>
              </Card>
            ))}

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
              {contents.filter(c => c.isNew && !c.isEditing).length > 0 && (
                <Button 
                  variant="contained" 
                  size="large" 
                  onClick={handleSaveNewContents}
                  startIcon={<Save />}
                >
                  신규 컨텐츠 저장
                </Button>
              )}
              {hasCheckedContents && (
                <Button
                  variant="contained"
                  size="large"
                  color="secondary"
                  onClick={handleGeneratePDF}
                  startIcon={<PictureAsPdf />}
                >
                  PDF로 저장
                </Button>
              )}
            </Box>
          </Paper>
        )}
      </Container>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          컨텐츠 삭제 확인
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            이 컨텐츠를 삭제하시겠습니까? 삭제된 컨텐츠는 복구할 수 없습니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            취소
          </Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}