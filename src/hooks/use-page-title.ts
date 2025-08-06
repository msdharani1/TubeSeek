
import { useEffect } from 'react';

const usePageTitle = (title: string, mainTitle = "TubeSeek") => {
  useEffect(() => {
    document.title = `${title} | ${mainTitle}`;
  }, [title, mainTitle]);
};

export { usePageTitle };
