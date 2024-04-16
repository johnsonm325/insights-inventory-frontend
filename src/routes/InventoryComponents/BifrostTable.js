import React, { useState } from 'react';
import propTypes from 'prop-types';
import {
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  ExpandableRowContent,
} from '@patternfly/react-table';
import { imageTableColumns } from './BifrostTableColumns';
import NestedHashTable from './NestedHashTable';
import BifrostTableRows from './BifrostTableRows';

const BifrostTable = ({ bootcImages }) => {
  const [expandedImageNames, setExpandedImageNames] = useState([]);

  const setImageExpanded = (image, isExpanding = true) =>
    setExpandedImageNames((prevExpanded) => {
      const otherExpandedImageNames = prevExpanded.filter(
        (r) => r !== image.image
      );
      return isExpanding
        ? [...otherExpandedImageNames, image.image]
        : otherExpandedImageNames;
    });

  const isImageExpanded = (image) => expandedImageNames.includes(image.image);

  return (
    <Table aria-label="Simple table">
      <Thead>
        <Tr>
          <Td />
          {imageTableColumns.map((col) => (
            <Th key={col.title} colSpan={col.colSpan} className={col.classname}>
              {col.title}
            </Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {bootcImages?.map((image, rowIndex) => (
          <>
            <Tr key={image.image}>
              <Td
                expand={{
                  rowIndex,
                  isExpanded: isImageExpanded(image),
                  onToggle: () =>
                    setImageExpanded(image, !isImageExpanded(image)),
                  expandId: 'composable-nested-table-expandable-example',
                }}
              />
              {imageTableColumns.map((col) => (
                <BifrostTableRows
                  key={`${image.image}-${col.title}`}
                  column={col}
                  data={image}
                />
              ))}
            </Tr>
            <Tr isExpanded={isImageExpanded(image)}>
              <Td
                dataLabel={`${imageTableColumns[0].title} expanded`}
                colSpan={12}
                style={{ paddingRight: '0px' }}
              >
                <ExpandableRowContent
                  style={{ paddingTop: '0px', paddingLeft: '64px' }}
                >
                  <NestedHashTable hashes={image.hashes} />
                </ExpandableRowContent>
              </Td>
            </Tr>
          </>
        ))}
      </Tbody>
    </Table>
  );
};

BifrostTable.propTypes = {
  bootcImages: propTypes.array,
};

export default BifrostTable;
