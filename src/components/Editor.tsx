// // 'use client';

// // import React, { useEffect, useRef } from 'react';
// // import { useRecoilValue } from 'recoil';
// // import { language, cmtheme } from '@/app/atoms';
// // import ACTIONS, { ActionType } from '@/actions/Actions';
// // import Editor from '@monaco-editor/react';

// // type Props = {
// //   socketRef: React.MutableRefObject<any>;
// //   roomId: string;
// //   onCodeChange: (code: string) => void;
// // };

// // const CodeEditor: React.FC<Props> = ({ socketRef, roomId, onCodeChange }) => {
// //   const lang = useRecoilValue(language);
// //   const editorTheme = useRecoilValue(cmtheme);
// //   const editorRef = useRef<any>(null);

// //   const handleEditorDidMount = (editor: any) => {
// //     editorRef.current = editor;

// //     editor.onDidChangeModelContent(() => {
// //       const code = editor.getValue();
// //       onCodeChange(code);
// //       socketRef.current.emit(ACTIONS.CODE_CHANGE, {
// //         roomId,
// //         code,
// //       });
// //     });
// //   };

// //   useEffect(() => {
// //     if (!socketRef.current) return;

// //     const handleCodeChange = ({ code }: { code: string }) => {
// //       if (editorRef.current && code !== null) {
// //         const currentCode = editorRef.current.getValue();
// //         if (currentCode !== code) {
// //           editorRef.current.setValue(code);
// //         }
// //       }
// //     };

// //     socketRef.current.on(ACTIONS.CODE_CHANGE, handleCodeChange);

// //     return () => {
// //       socketRef.current.off(ACTIONS.CODE_CHANGE, handleCodeChange);
// //     };
// //   }, [socketRef]);

// //   return (
// //     <div className="h-full w-full">
// //       <Editor
// //         height="100%"
// //         defaultLanguage={lang || 'javascript'}
// //         theme={editorTheme || 'vs-dark'}
// //         defaultValue="// Start coding here..."
// //         onMount={handleEditorDidMount}
// //         options={{
// //           automaticLayout: true,
// //           autoClosingBrackets: 'always',
// //           autoIndent: 'advanced',
// //           minimap: { enabled: false },
// //           scrollBeyondLastLine: false,
// //         }}
// //       />
// //     </div>
// //   );
// // };

// // export default CodeEditor;
// 'use client';

// import React, { useEffect, useRef } from 'react';
// import { useAtom } from 'jotai';
// import { language, cmtheme } from '@/app/atoms';  // Assuming you have these atoms defined in `atoms.ts`
// import ACTIONS from '@/actions/Actions';
// import Editor from '@monaco-editor/react';

// type Props = {
//   socketRef: React.MutableRefObject<any>;
//   roomId: string;
//   onCodeChange: (code: string) => void;
// };

// const CodeEditor: React.FC<Props> = ({ socketRef, roomId, onCodeChange }) => {
//   const [lang] = useAtom(language);
//   const [editorTheme] = useAtom(cmtheme);
//   const editorRef = useRef<any>(null);

//   const handleEditorDidMount = (editor: any) => {
//     editorRef.current = editor;

//     editor.onDidChangeModelContent(() => {
//       const code = editor.getValue();
//       onCodeChange(code);
//       socketRef.current.emit(ACTIONS.CODE_CHANGE, {
//         roomId,
//         code,
//       });
//     });
//   };

//   useEffect(() => {
//     if (!socketRef.current) return;

//     const handleCodeChange = ({ code }: { code: string }) => {
//       if (editorRef.current && code !== null) {
//         const currentCode = editorRef.current.getValue();
//         if (currentCode !== code) {
//           editorRef.current.setValue(code);
//         }
//       }
//     };

//     socketRef.current.on(ACTIONS.CODE_CHANGE, handleCodeChange);

//     return () => {
//       socketRef.current.off(ACTIONS.CODE_CHANGE, handleCodeChange);
//     };
//   }, [socketRef]);

//   return (
//     <div className="h-full w-full">
//       <Editor
//         height="100%"
//         defaultLanguage={lang || 'javascript'}
//         theme={editorTheme || 'vs-dark'}
//         defaultValue="// Start coding here..."
//         onMount={handleEditorDidMount}
//         options={{
//           automaticLayout: true,
//           autoClosingBrackets: 'always',
//           autoIndent: 'advanced',
//           minimap: { enabled: false },
//           scrollBeyondLastLine: false,
//         }}
//       />
//     </div>
//   );
// };

// export default CodeEditor;
'use client';

import React, { useEffect, useRef } from 'react';
// import { useRecoilValue } from 'recoil';
// import { language, cmtheme } from '@/app/atoms';
import { Editor as MonacoEditor, OnChange } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

import ACTIONS from '../actions/Actions';

interface EditorProps {
  socketRef: React.MutableRefObject<any>;
  roomId: string;
  onCodeChange: (code: string) => void;
}

const Editor: React.FC<EditorProps> = ({ socketRef, roomId, onCodeChange }) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const lang = 'javascript';
  const editorTheme = 'monkai'; // For Monaco, themes are: 'vs-dark', 'light', etc.
  console.log("HERE");

  const handleEditorDidMount = (
    editor: monaco.editor.IStandaloneCodeEditor
  ) => {
    editorRef.current = editor;
  };
  console.log("HERE2", editorRef.current?.getValue());

  const handleChange: OnChange = (value, ev) => {
    if (value !== undefined) {
      onCodeChange(value);
      socketRef.current.emit(ACTIONS.CODE_CHANGE, {
        roomId,
        code: value,
      });
      console.log("This Change", value);
    }
  };

  useEffect(() => {
    console.log("Other Change 1");
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }: { code: string }) => {
        if (editorRef.current && code !== null) {
          const currentValue = editorRef.current.getValue();
          if (currentValue !== code) {
            editorRef.current.setValue(code);
            console.log("Other Change", code);
          }
        }
      });
    }

    return () => {
      socketRef.current?.off(ACTIONS.CODE_CHANGE);
    };
  }, [socketRef.current]);

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <MonacoEditor
        height="100vh"
        defaultLanguage={lang}
        defaultValue=""
        onChange={handleChange}
        theme={'dark'}
        onMount={handleEditorDidMount}
        options={{
          automaticLayout: true,
          autoClosingBrackets: 'always',
          autoClosingQuotes: 'always',
          fontSize: 14,
        }}
      />
    </div>
  );
};

export default Editor;
