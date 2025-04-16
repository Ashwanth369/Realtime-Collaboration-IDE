"use client";

import React, { useEffect, useRef } from "react";
// import { useRecoilValue } from 'recoil';
// import { language, cmtheme } from '@/app/atoms';
import { Editor as MonacoEditor, OnChange } from "@monaco-editor/react";
import * as monaco from "monaco-editor";

import ACTIONS from "../actions/Actions";

interface EditorProps {
  socketRef: React.MutableRefObject<any>;
  roomId: string;
  onCodeChange: (code: string) => void;
}

const Editor: React.FC<EditorProps> = ({ socketRef, roomId, onCodeChange }) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const lang = "javascript";
  const editorTheme = "monkai";

  const handleEditorDidMount = (
    editor: monaco.editor.IStandaloneCodeEditor
  ) => {
    editorRef.current = editor;
  };

  const handleChange: OnChange = (value, ev) => {
    if (value !== undefined) {
      onCodeChange(value);
      socketRef.current.emit(ACTIONS.CODE_CHANGE, {
        roomId,
        code: value,
      });
    }
  };

  useEffect(() => {
    console.log("Entering useEffect for socketRef.current:", socketRef.current);
    if (socketRef.current) {
      console.log("Waitin for code change:", socketRef.current);
      socketRef.current.on(
        ACTIONS.CODE_CHANGE,
        ({ code }: { code: string }) => {
          console.log("Code change received:", code, editorRef.current);

          if (!editorRef.current) {
            editorRef.current = {} as monaco.editor.IStandaloneCodeEditor;
          }

          console.log("Syncing received code:", code, editorRef.current);
          if (code !== null) {
            const currentValue = editorRef.current.getValue();
            if (currentValue !== code) {
              editorRef.current.setValue(code);
            }
          }
        }
      );
    }

    return () => {
      socketRef.current?.off(ACTIONS.CODE_CHANGE);
    };
  }, [socketRef.current]);

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <MonacoEditor
        height="100vh"
        defaultLanguage={lang}
        defaultValue=""
        onChange={handleChange}
        theme={"dark"}
        onMount={handleEditorDidMount}
        options={{
          automaticLayout: true,
          autoClosingBrackets: "always",
          autoClosingQuotes: "always",
          fontSize: 14,
        }}
      />
    </div>
  );
};

export default Editor;
