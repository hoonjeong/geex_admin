-- class_content 테이블에 answer 필드 추가
ALTER TABLE class_content 
ADD COLUMN answer TEXT AFTER content;

-- 기존 데이터에 대한 기본값 설정 (선택사항)
UPDATE class_content 
SET answer = '' 
WHERE answer IS NULL;