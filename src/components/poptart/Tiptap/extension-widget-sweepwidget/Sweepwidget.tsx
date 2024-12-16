// import { openWindow } from '$utils/openWindow';
// import { useModal } from '@cristata/react-modal-hook';
// import { Delete16Regular, Edit16Regular, Open16Regular } from '@fluentui/react-icons';
// import type { Node, NodeViewProps } from '@tiptap/core';
// import { NodeViewWrapper } from '@tiptap/react';
// import IframeResizer from 'iframe-resizer-react';
// import { useRef, useState } from 'react';
// import { PlainModal } from '../../Modal';
// import { TextInput } from '../../TextInput';
// import { WidgetActions, WidgetLabel, WidgetWrapper } from '../components/Widget';
// import type { SweepwidgetWidgetOptions } from './sweepwidgetWidget';

// interface ISweepwidget extends NodeViewProps {
//   extension: Node<SweepwidgetWidgetOptions>;
// }

// function Sweepwidget(props: ISweepwidget) {
//   const widgetRef = useRef<HTMLDivElement>(null);
//   const [isMouseOver, setIsMouseOver] = useState<boolean>(false);

//   const [showEditModal, hideEditModal] = useModal(() => {
//     // eslint-disable-next-line react-hooks/rules-of-hooks
//     const [idValue, setIdValue] = useState<HTMLTextAreaElement['value']>(props.node.attrs.id);

//     /**
//      * When the user types in the field, update `noteValue` in state
//      */
//     const handleIdFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//       setIdValue(e.target.value);
//     };

//     return (
//       <PlainModal
//         hideModal={hideEditModal}
//         title={`Change SweedpWidget ID`}
//         continueButton={{
//           text: 'Save',
//           onClick: () => {
//             props.updateAttributes({ id: idValue });
//             return true;
//           },
//           disabled: idValue.length < 1 || !props.editor.isEditable,
//         }}
//       >
//         <TextInput
//           name={'edit-id'}
//           id={'edit-id'}
//           value={idValue}
//           onChange={handleIdFieldChange}
//           placeholder={`Type id...`}
//         ></TextInput>
//       </PlainModal>
//     );
//   }, [props.node.attrs.id]);

//   return (
//     <NodeViewWrapper contentEditable={false}>
//       <WidgetWrapper
//         ref={widgetRef}
//         onMouseOver={() => setIsMouseOver(true)}
//         onMouseOut={() => setIsMouseOver(false)}
//       >
//         <IframeResizer
//           autoResize={true}
//           resizeFrom={'child'}
//           checkOrigin={false}
//           srcDoc={`
//             <head>
//               <script type="text/javascript" src="./scripts/iframeResizer.contentWindow.min.js"></script>
//             </head>
//             <body>
//               <div id="${props.node.attrs.id}" class="sw_container"></div>
//               <script type="text/javascript" src="https://sweepwidget.com/w/j/w_init.js"></script>
//             </body>
//           `}
//           style={{ border: 'none', width: '100%', minWidth: '100%' }}
//         />
//         <WidgetLabel isVisible={isMouseOver} data-drag-handle draggable={true}>
//           SweepWidget
//         </WidgetLabel>
//         <WidgetActions
//           isVisible={isMouseOver}
//           actions={[
//             {
//               icon: <Open16Regular />,
//               label: 'Open giveaway landing page',
//               onClick: () =>
//                 openWindow(
//                   `https://sweepwidget.com/view/${props.node.attrs.id}`,
//                   `sweepwidget-${props.node.attrs.id}`,
//                   undefined,
//                   { customName: 'SweepWidget' }
//                 ),
//             },
//             {
//               icon: <Edit16Regular />,
//               label: 'Change giveaway ID',
//               onClick: showEditModal,
//               disabled: !props.editor.isEditable,
//             },
//             {
//               icon: <Delete16Regular />,
//               label: 'Remove widget',
//               onClick: props.deleteNode,
//               disabled: !props.editor.isEditable,
//             },
//           ]}
//         ></WidgetActions>
//       </WidgetWrapper>
//     </NodeViewWrapper>
//   );
// }

// export { Sweepwidget };
